"use client";

import { useState, useRef } from "react";

interface CompactCsvUploadProps {
  seasonId: number;
  onUploadComplete: () => void;
}

interface CsvRow {
  name: string;
  rank: number;
  status: 'pending' | 'success' | 'error' | 'not_found' | 'ranking_unchanged' | 'ranking_conflict';
  error?: string;
  action?: string;
  selected?: boolean; // For selecting not found players to create
  currentRank?: number; // For ranking conflicts
}

export default function CompactCsvUpload({ seasonId, onUploadComplete }: CompactCsvUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPlayers, setIsCreatingPlayers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResults, setUploadResults] = useState<CsvRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (csvText: string): CsvRow[] => {
    const lines = csvText.trim().split('\n');
    
    // Remove header row if it exists
    const dataLines = lines[0].toLowerCase().includes('name') && lines[0].toLowerCase().includes('rank') 
      ? lines.slice(1) 
      : lines;

    const rows: CsvRow[] = [];

    dataLines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines

      // Split by comma, but handle potential commas within quoted names
      const parts = trimmedLine.split(',').map(part => part.trim().replace(/^["']|["']$/g, ''));
      
      if (parts.length >= 2) {
        const name = parts[0];
        const rankStr = parts[1];
        const rank = parseFloat(rankStr);

        if (name && !isNaN(rank)) {
          rows.push({
            name,
            rank,
            status: 'pending'
          });
        } else {
          rows.push({
            name: name || `Row ${index + 1}`,
            rank: rank || 0,
            status: 'error',
            error: `Invalid data: name="${name}", rank="${rankStr}"`
          });
        }
      } else {
        rows.push({
          name: `Row ${index + 1}`,
          rank: 0,
          status: 'error',
          error: `Invalid format: expected "Name,Rank" but got "${trimmedLine}"`
        });
      }
    });

    return rows;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const rows = parseCsv(csvText);
      setPreviewData(rows);
      setShowPreview(true);
      setUploadResults([]);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;

    setIsUploading(true);
    const results: CsvRow[] = [];

    try {
      const validRows = previewData.filter(row => row.status !== 'error');
      
      const response = await fetch('/api/seasons/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId,
          players: validRows.map(row => ({ name: row.name, rank: row.rank }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Update results based on API response
      validRows.forEach((row, index) => {
        const result = data.results[index];
        if (result.success) {
          results.push({
            ...row,
            status: result.action === 'ranking_unchanged' ? 'ranking_unchanged' : 'success',
            action: result.action
          });
        } else if (result.action === 'player_not_found') {
          results.push({
            ...row,
            status: 'not_found',
            error: result.error,
            action: result.action,
            selected: false // Initialize as not selected
          });
        } else if (result.action === 'ranking_conflict') {
          results.push({
            ...row,
            status: 'ranking_conflict',
            error: result.error,
            action: result.action,
            currentRank: result.currentRank,
            selected: false // Initialize as not selected
          });
        } else {
          results.push({
            ...row,
            status: 'error',
            error: result.error,
            action: result.action
          });
        }
      });

      // Add error rows as they were
      previewData.filter(row => row.status === 'error').forEach(row => {
        results.push(row);
      });

      setUploadResults(results);
      setShowPreview(false);
      
      // Call the completion callback to refresh the page
      onUploadComplete();
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setPreviewData([]);
    setShowPreview(false);
    setUploadResults([]);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlayerSelection = (index: number) => {
    setUploadResults(prev => 
      prev.map((row, i) => 
        i === index && (row.status === 'not_found' || row.status === 'ranking_conflict')
          ? { ...row, selected: !row.selected }
          : row
      )
    );
  };

  const selectAllNotFound = () => {
    setUploadResults(prev => 
      prev.map(row => 
        (row.status === 'not_found' || row.status === 'ranking_conflict')
          ? { ...row, selected: true }
          : row
      )
    );
  };

  const deselectAllNotFound = () => {
    setUploadResults(prev => 
      prev.map(row => 
        (row.status === 'not_found' || row.status === 'ranking_conflict')
          ? { ...row, selected: false }
          : row
      )
    );
  };

  const removeSelectedNotFound = () => {
    setUploadResults(prev => 
      prev.filter(row => 
        (row.status !== 'not_found' && row.status !== 'ranking_conflict') || !row.selected
      )
    );
  };

  const createSinglePlayer = async (playerIndex: number) => {
    const player = uploadResults[playerIndex];
    if (!player || player.status !== 'not_found') return;

    setIsCreatingPlayers(true);

    try {
      // First, create the player
      const createResponse = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: player.name.trim()
        }),
      });

      if (createResponse.ok) {
        // Player created successfully, now add ranking to season
        try {
          const rankingResponse = await fetch('/api/seasons/import-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              seasonId,
              players: [{ name: player.name.trim(), rank: player.rank }]
            }),
          });

          if (rankingResponse.ok) {
            // Both player creation and ranking addition successful
            setUploadResults(prev => 
              prev.map((r, i) => 
                i === playerIndex 
                  ? {
                      ...r,
                      status: 'success' as const,
                      action: 'player_created_and_ranked',
                      selected: false
                    }
                  : r
              )
            );
            // Refresh the page data since we added a new ranking
            onUploadComplete();
          } else {
            // Player created but ranking failed
            setUploadResults(prev => 
              prev.map((r, i) => 
                i === playerIndex 
                  ? {
                      ...r,
                      status: 'success' as const,
                      action: 'player_created',
                      error: 'Player created but ranking could not be added',
                      selected: false
                    }
                  : r
              )
            );
          }
        } catch {
          // Player created but ranking failed due to network error
          setUploadResults(prev => 
            prev.map((r, i) => 
              i === playerIndex 
                ? {
                    ...r,
                    status: 'success' as const,
                    action: 'player_created',
                    error: 'Player created but ranking could not be added due to network error',
                    selected: false
                  }
                : r
            )
          );
        }
      } else {
        const errorData = await createResponse.json();
        setUploadResults(prev => 
          prev.map((r, i) => 
            i === playerIndex 
              ? {
                  ...r,
                  status: 'error' as const,
                  error: errorData.error || 'Failed to create player',
                  selected: false
                }
              : r
          )
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_createError) {
      setUploadResults(prev => 
        prev.map((r, i) => 
          i === playerIndex 
            ? {
                ...r,
                status: 'error' as const,
                error: 'Network error creating player',
                selected: false
              }
            : r
        )
      );
    } finally {
      setIsCreatingPlayers(false);
    }
  };

  const updateSinglePlayerRanking = async (playerIndex: number) => {
    const player = uploadResults[playerIndex];
    if (!player || player.status !== 'ranking_conflict') return;

    setIsCreatingPlayers(true);

    try {
      const response = await fetch('/api/seasons/update-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId,
          playerName: player.name.trim(),
          newRank: player.rank
        }),
      });

      if (response.ok) {
        // Update results - replace this ranking_conflict with success
        setUploadResults(prev => 
          prev.map((r, i) => 
            i === playerIndex 
              ? {
                  ...r,
                  status: 'success' as const,
                  action: 'updated_ranking',
                  selected: false
                }
              : r
          )
        );
        // Refresh the page data since we updated a ranking
        onUploadComplete();
      } else {
        const errorData = await response.json();
        setUploadResults(prev => 
          prev.map((r, i) => 
            i === playerIndex 
              ? {
                  ...r,
                  status: 'error' as const,
                  error: errorData.error || 'Failed to update ranking',
                  selected: false
                }
              : r
          )
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_updateError) {
      setUploadResults(prev => 
        prev.map((r, i) => 
          i === playerIndex 
            ? {
                ...r,
                status: 'error' as const,
                error: 'Network error updating ranking',
                selected: false
              }
            : r
        )
      );
    } finally {
      setIsCreatingPlayers(false);
    }
  };

  const removeSinglePlayer = (playerIndex: number) => {
    setUploadResults(prev => prev.filter((_, i) => i !== playerIndex));
  };

  const createSelectedPlayers = async () => {
    const selectedPlayers = uploadResults.filter(row => 
      (row.status === 'not_found' || row.status === 'ranking_conflict') && row.selected
    );

    if (selectedPlayers.length === 0) return;

    setIsCreatingPlayers(true);

    try {
      // Process players one by one
      const processResults: CsvRow[] = [];
      
      for (const player of selectedPlayers) {
        try {
          if (player.status === 'not_found') {
            // Create the player first
            const createResponse = await fetch('/api/players', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: player.name.trim()
              }),
            });

            if (createResponse.ok) {
              // Player created successfully, now add ranking to season
              try {
                const rankingResponse = await fetch('/api/seasons/import-csv', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    seasonId,
                    players: [{ name: player.name.trim(), rank: player.rank }]
                  }),
                });

                if (rankingResponse.ok) {
                  // Both player creation and ranking addition successful
                  processResults.push({
                    ...player,
                    status: 'success',
                    action: 'player_created_and_ranked',
                    selected: false
                  });
                } else {
                  // Player created but ranking failed
                  processResults.push({
                    ...player,
                    status: 'success',
                    action: 'player_created',
                    error: 'Player created but ranking could not be added',
                    selected: false
                  });
                }
              } catch {
                // Player created but ranking failed due to network error
                processResults.push({
                  ...player,
                  status: 'success',
                  action: 'player_created',
                  error: 'Player created but ranking could not be added due to network error',
                  selected: false
                });
              }
            } else {
              const errorData = await createResponse.json();
              processResults.push({
                ...player,
                status: 'error',
                error: errorData.error || 'Failed to create player',
                selected: false
              });
            }
          } else if (player.status === 'ranking_conflict') {
            // Update the ranking
            const response = await fetch('/api/seasons/update-ranking', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                seasonId,
                playerName: player.name.trim(),
                newRank: player.rank
              }),
            });

            if (response.ok) {
              processResults.push({
                ...player,
                status: 'success',
                action: 'updated_ranking',
                selected: false
              });
            } else {
              const errorData = await response.json();
              processResults.push({
                ...player,
                status: 'error',
                error: errorData.error || 'Failed to update ranking',
                selected: false
              });
            }
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_playerError) {
          processResults.push({
            ...player,
            status: 'error',
            error: 'Network error processing player',
            selected: false
          });
        }
      }

      // Update the results - replace the selected players with process results
      setUploadResults(prev => {
        const newResults = prev.filter(row => 
          (row.status !== 'not_found' && row.status !== 'ranking_conflict') || !row.selected
        );
        return [...newResults, ...processResults];
      });

      // Refresh the page data if any rankings were created or updated
      const hasRankingChanges = processResults.some(r => 
        r.action === 'player_created_and_ranked' || r.action === 'updated_ranking'
      );
      if (hasRankingChanges) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('Error processing players:', error);
      alert('Failed to process players. Please try again.');
    } finally {
      setIsCreatingPlayers(false);
    }
  };

  const validRows = previewData.filter(row => row.status !== 'error');
  const errorRows = previewData.filter(row => row.status === 'error');
  const successRows = uploadResults.filter(row => row.status === 'success');
  const unchangedRows = uploadResults.filter(row => row.status === 'ranking_unchanged');
  const notFoundRows = uploadResults.filter(row => row.status === 'not_found');
  const rankingConflictRows = uploadResults.filter(row => row.status === 'ranking_conflict');
  const failedRows = uploadResults.filter(row => row.status === 'error');
  const createdPlayersRows = uploadResults.filter(row => row.action === 'player_created');
  const createdAndRankedRows = uploadResults.filter(row => row.action === 'player_created_and_ranked');
  const updatedRankingRows = uploadResults.filter(row => row.action === 'updated_ranking');

  // Combined list of actionable rows (not found + ranking conflicts)
  const actionableRows = [...notFoundRows, ...rankingConflictRows];

  return (
    <>
      {/* Compact Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:shadow-md whitespace-nowrap"
        title="Import players from CSV"
      >
        📄 Import CSV
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Import Players from CSV</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">📋 CSV Format Requirements</h4>
                  <p className="text-gray-600 mb-3">
                    Upload a CSV file with columns: <strong>Name, Rank</strong>
                  </p>
                  <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm text-gray-700 mb-3">
                    Example:<br/>
                    Name,Rank<br/>
                    Player One,5.75<br/>
                    Player Two,6.14
                  </div>
                  <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                    ⚠️ <strong>Note:</strong> Players not found in the database can be created through the manual review process.
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-lg text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 file:transition-colors file:shadow-md"
                />
              </div>

              {showPreview && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-xl font-semibold text-blue-800">
                      📊 CSV Preview ({previewData.length} rows found)
                    </h4>
                    <div className="flex gap-3">
                      <button
                        onClick={resetUpload}
                        className="px-4 py-2 text-lg font-medium text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || validRows.length === 0}
                        className={`px-6 py-2 text-lg font-medium rounded-lg transition-colors shadow-md ${
                          isUploading || validRows.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                        }`}
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Processing...
                          </span>
                        ) : (
                          `🚀 Process ${validRows.length} Players`
                        )}
                      </button>
                    </div>
                  </div>

                  {validRows.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-green-800 mb-2">
                        ✅ Ready to import: {validRows.length} valid players
                      </h5>
                      <p className="text-green-700">
                        These players will be processed and added to the season if they exist in the database.
                      </p>
                    </div>
                  )}

                  {errorRows.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                      <h5 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                        ❌ Errors ({errorRows.length} rows will be skipped)
                      </h5>
                      <div className="text-sm text-red-700 space-y-2 max-h-32 overflow-y-auto bg-white p-3 rounded border border-red-200">
                        {errorRows.slice(0, 5).map((row, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{row.error}</span>
                          </div>
                        ))}
                        {errorRows.length > 5 && (
                          <div className="flex items-center gap-2 text-red-600 font-medium">
                            <span className="text-red-500">•</span>
                            <span>... and {errorRows.length - 5} more errors</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Rank</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index} className={`transition-colors ${
                            row.status === 'error' ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'
                          }`}>
                            <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                            <td className="px-4 py-3 text-gray-700">{row.rank}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                row.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {row.status === 'error' ? '❌ Error' : '✅ Ready'}
                              </span>
                              {row.error && (
                                <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">{row.error}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {uploadResults.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Upload Complete!</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {(successRows.length - createdPlayersRows.length - createdAndRankedRows.length - updatedRankingRows.length) > 0 && (
                        <p>✅ Successfully processed {successRows.length - createdPlayersRows.length - createdAndRankedRows.length - updatedRankingRows.length} players</p>
                      )}
                      {unchangedRows.length > 0 && (
                        <p>⚪ {unchangedRows.length} players already have correct rankings (skipped)</p>
                      )}
                      {createdAndRankedRows.length > 0 && (
                        <p>🎉 Created {createdAndRankedRows.length} new players and added their rankings</p>
                      )}
                      {createdPlayersRows.length > 0 && (
                        <p>👤 Created {createdPlayersRows.length} new players (rankings may need manual addition)</p>
                      )}
                      {updatedRankingRows.length > 0 && (
                        <p>📊 Updated {updatedRankingRows.length} player rankings</p>
                      )}
                      {notFoundRows.length > 0 && (
                        <p>⚠️ {notFoundRows.length} players not found in database</p>
                      )}
                      {rankingConflictRows.length > 0 && (
                        <p>🔄 {rankingConflictRows.length} players have different rankings</p>
                      )}
                      {failedRows.length > 0 && (
                        <p>❌ {failedRows.length} players failed to process</p>
                      )}
                    </div>
                  </div>

                  {(createdPlayersRows.length > 0 || createdAndRankedRows.length > 0) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">
                        Successfully Created {createdPlayersRows.length + createdAndRankedRows.length} Players! 🎉
                      </h5>
                      <div className="text-sm text-green-700">
                        {createdAndRankedRows.length > 0 && (
                          <div className="mb-3">
                            <p className="font-medium mb-1">✅ Created with rankings ({createdAndRankedRows.length}):</p>
                            <div className="space-y-1">
                              {createdAndRankedRows.map((row, index) => (
                                <div key={index}>• {row.name} (Rank: {row.rank})</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {createdPlayersRows.length > 0 && (
                          <div className="mb-3">
                            <p className="font-medium mb-1">⚠️ Created but rankings need manual addition ({createdPlayersRows.length}):</p>
                            <div className="space-y-1">
                              {createdPlayersRows.map((row, index) => (
                                <div key={index}>• {row.name} {row.error && <span className="text-orange-600">({row.error})</span>}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {createdAndRankedRows.length > 0 && (
                          <p className="text-xs text-green-600 bg-green-100 p-2 rounded">
                            🎉 <strong>All done!</strong> These players have been created and their rankings added to the season.
                          </p>
                        )}
                        {createdPlayersRows.length > 0 && createdAndRankedRows.length === 0 && (
                          <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                            💡 <strong>Tip:</strong> Now you can re-upload your CSV to add rankings for these newly created players!
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {actionableRows.length > 0 && (
                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-orange-800">
                          Manual Review Required ({actionableRows.length} items)
                        </h5>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllNotFound}
                            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            title="Select all for action"
                          >
                            ✓ Select All
                          </button>
                          <button
                            onClick={deselectAllNotFound}
                            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            title="Deselect all"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                        <div className="text-sm text-orange-800">
                          <div className="font-medium mb-2">📋 What to do:</div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {notFoundRows.length > 0 && (
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">🚫</span>
                                <div>
                                  <div className="font-medium">Missing Players ({notFoundRows.length})</div>
                                  <div className="text-xs text-orange-700">These players don't exist in the database and will be created</div>
                                </div>
                              </div>
                            )}
                            {rankingConflictRows.length > 0 && (
                              <div className="flex items-start gap-2">
                                <span className="text-yellow-600 font-bold">⚠️</span>
                                <div>
                                  <div className="font-medium">Ranking Conflicts ({rankingConflictRows.length})</div>
                                  <div className="text-xs text-orange-700">Players already exist with different rankings</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-orange-700">
                            ✅ <strong>Tip:</strong> Select multiple items and use "Process Selected" for bulk actions, or use individual buttons for one-by-one control.
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-orange-200">
                        {actionableRows.map((row, index) => {
                          const originalIndex = uploadResults.findIndex(r => r === row);
                          const isConflict = row.status === 'ranking_conflict';
                          return (
                            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              row.selected 
                                ? isConflict 
                                  ? 'bg-yellow-100 border-yellow-300 shadow-md' 
                                  : 'bg-green-100 border-green-300 shadow-md'
                                : isConflict 
                                ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' 
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                              <div className="flex items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={row.selected || false}
                                  onChange={() => togglePlayerSelection(originalIndex)}
                                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg text-gray-800">{row.name}</span>
                                    {isConflict ? (
                                      <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                                        CONFLICT
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded-full">
                                        MISSING
                                      </span>
                                    )}
                                  </div>
                                  {isConflict ? (
                                    <div className="text-sm text-yellow-700 mt-1">
                                      <span className="font-medium">Current rank:</span> {row.currentRank} 
                                      <span className="mx-2">→</span> 
                                      <span className="font-medium">New rank:</span> {row.rank}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Will be created with rank:</span> {row.rank}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => 
                                    isConflict 
                                      ? updateSinglePlayerRanking(originalIndex)
                                      : createSinglePlayer(originalIndex)
                                  }
                                  disabled={isCreatingPlayers}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isCreatingPlayers
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : isConflict
                                      ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-md'
                                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                  }`}
                                  title={isConflict ? "Update ranking" : "Create player and add ranking"}
                                >
                                  {isConflict ? '📊 Update Rank' : '✓ Create Player'}
                                </button>
                                <button
                                  onClick={() => removeSinglePlayer(originalIndex)}
                                  className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                                  title="Remove from list"
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {actionableRows.some(row => row.selected) && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t-2 border-orange-200">
                          <div className="flex-1">
                            <div className="text-sm text-orange-700 mb-2 font-medium">
                              🎯 Ready to process {actionableRows.filter(r => r.selected).length} selected item{actionableRows.filter(r => r.selected).length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={createSelectedPlayers}
                                disabled={isCreatingPlayers}
                                className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors shadow-lg ${
                                  isCreatingPlayers
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                                }`}
                              >
                                {isCreatingPlayers ? (
                                  <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Processing...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    ✓ Process {actionableRows.filter(r => r.selected).length} Selected
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={removeSelectedNotFound}
                                disabled={isCreatingPlayers}
                                className="px-4 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg transform hover:scale-105"
                              >
                                ✕ Remove Selected
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={resetUpload}
                      className="px-6 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                      🔄 Close & Reset
                    </button>
                    {actionableRows.length > 0 && (
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-6 py-3 text-lg font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
                      >
                        📊 View Summary
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
