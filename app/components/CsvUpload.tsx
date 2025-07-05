"use client";

import { useState, useRef } from "react";
import { GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";

interface CsvUploadProps {
  seasonId: number;
  onUploadComplete: () => void;
}

interface CsvRow {
  name: string;
  rank: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface ServerResult {
  name: string;
  rank: number;
  success: boolean;
  error?: string;
}

export default function CsvUpload({ seasonId, onUploadComplete }: CsvUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
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
      const response = await fetch('/api/seasons/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId,
          players: previewData.filter(row => row.status !== 'error')
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update results with server response
        previewData.forEach(row => {
          const serverResult = result.results?.find((r: ServerResult) => r.name === row.name);
          results.push({
            ...row,
            status: serverResult?.success ? 'success' : 'error',
            error: serverResult?.error
          });
        });

        setUploadResults(results);
        
        if (result.successCount > 0) {
          onUploadComplete();
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validRows = previewData.filter(row => row.status !== 'error');
  const errorRows = previewData.filter(row => row.status === 'error');

  return (
    <div className={`${GLASSY_CONTAINER_CLASSES} p-6`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Players from CSV</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Upload a CSV file with columns: <strong>Name,Rank</strong>
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Example: &quot;Alex Berg,5.75&quot; or &quot;Andre Lancour,6.14&quot;
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
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {validRows.length > 0 && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isUploading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : `Import ${validRows.length} Players`}
                </button>
              )}
            </div>
          </div>

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
                    row.status === 'error' ? 'bg-red-50' :
                    row.status === 'success' ? 'bg-green-50' : 'bg-white'
                  }>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.rank}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'error' ? 'bg-red-100 text-red-800' :
                        row.status === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.status === 'error' ? 'Error' :
                         row.status === 'success' ? 'Success' : 'Ready'}
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Upload Complete!</h4>
          <p className="text-sm text-blue-700">
            Successfully imported {uploadResults.filter(r => r.status === 'success').length} players.
            {uploadResults.filter(r => r.status === 'error').length > 0 && (
              <span> {uploadResults.filter(r => r.status === 'error').length} failed.</span>
            )}
          </p>
          <button
            onClick={resetUpload}
            className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
