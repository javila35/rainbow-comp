"use client";

import { useState, useRef } from "react";

interface CompactCsvUploadProps {
  seasonId: number;
  onUploadComplete: () => void;
}

interface CsvRow {
  name: string;
  rank: number;
  status: 'pending' | 'success' | 'error' | 'not_found';
  error?: string;
  action?: string;
}

export default function CompactCsvUpload({ seasonId, onUploadComplete }: CompactCsvUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
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
            status: 'success',
            action: result.action
          });
        } else if (result.action === 'player_not_found') {
          results.push({
            ...row,
            status: 'not_found',
            error: result.error,
            action: result.action
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

  const validRows = previewData.filter(row => row.status !== 'error');
  const errorRows = previewData.filter(row => row.status === 'error');
  const successRows = uploadResults.filter(row => row.status === 'success');
  const notFoundRows = uploadResults.filter(row => row.status === 'not_found');
  const failedRows = uploadResults.filter(row => row.status === 'error');

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Import Players from CSV</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file with columns: <strong>Name,Rank</strong>
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Example: "Alex Berg,5.75" or "Andre Lancour,6.14"
                </p>
                <p className="text-xs text-orange-600 mb-4">
                  ⚠️ Only players that already exist in the database will be added to this season.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {showPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Preview ({previewData.length} rows)</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={resetUpload}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || validRows.length === 0}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isUploading || validRows.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isUploading ? 'Uploading...' : `Upload ${validRows.length} Players`}
                      </button>
                    </div>
                  </div>

                  {validRows.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-green-800 mb-1">
                        Ready to import: {validRows.length} players
                      </h5>
                    </div>
                  )}

                  {errorRows.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-red-800 mb-2">
                        Errors ({errorRows.length} rows will be skipped):
                      </h5>
                      <div className="text-xs text-red-700 space-y-1">
                        {errorRows.slice(0, 3).map((row, index) => (
                          <div key={index}>• {row.error}</div>
                        ))}
                        {errorRows.length > 3 && (
                          <div>• ... and {errorRows.length - 3} more errors</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Rank</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index} className={
                            row.status === 'error' ? 'bg-red-50' : 'bg-white'
                          }>
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2">{row.rank}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                row.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {row.status === 'error' ? 'Error' : 'Ready'}
                              </span>
                              {row.error && (
                                <div className="text-xs text-red-600 mt-1">{row.error}</div>
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
                      {successRows.length > 0 && (
                        <p>✅ Successfully processed {successRows.length} players</p>
                      )}
                      {notFoundRows.length > 0 && (
                        <p>⚠️ {notFoundRows.length} players not found in database</p>
                      )}
                      {failedRows.length > 0 && (
                        <p>❌ {failedRows.length} players failed to process</p>
                      )}
                    </div>
                  </div>

                  {notFoundRows.length > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">
                        Players Not Found in Database ({notFoundRows.length})
                      </h5>
                      <div className="text-sm text-orange-700">
                        <p className="mb-2">These players were not added because they don't exist in the database:</p>
                        <div className="space-y-1">
                          {notFoundRows.map((row, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{row.name}</span>
                              <span className="font-mono">Rank: {row.rank}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-orange-600">
                          Create these players first, then re-upload the CSV to add their rankings.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={resetUpload}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Close
                    </button>
                    {notFoundRows.length > 0 && (
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                      >
                        View Results
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
