'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  Upload, 
  Search, 
  FileText, 
  AlertCircle, 
  Check, 
  Loader2, 
  Download,
  Eye,
  Highlighter,
  X,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SearchResult {
  text: string;
  page: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

interface ScanResults {
  searchTerm: string;
  totalMatches: number;
  results: SearchResult[];
  documentUrl: string;
  fileName: string;
}

const DocumentScanner: React.FC = () => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [navigatingToResult, setNavigatingToResult] = useState<string | null>(null);

  // Function to navigate to specific page and highlight text
  const navigateToSearchResult = async (result: SearchResult) => {
    if (!scanResults) return;
    
    const resultId = `${result.page}-${result.confidence}`;
    setNavigatingToResult(resultId);
    
    try {
      // For iframe-based PDF viewers, we can try to navigate to the page
      // and use URL fragments for page navigation
      const encodedText = encodeURIComponent(result.text.slice(0, 50)); // Use first 50 chars
      const timestamp = Date.now(); // Add timestamp to force reload
      const pdfUrl = `${scanResults.documentUrl}#page=${result.page}&search=${encodedText}&t=${timestamp}`;
      
      // Force iframe reload by briefly clearing src then setting new URL
      if (iframeRef.current) {
        // Clear the iframe first to force a reload
        iframeRef.current.src = 'about:blank';
        
        // Set the new URL after a brief delay
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = pdfUrl;
          }
          // Clear loading state
          setTimeout(() => setNavigatingToResult(null), 500);
        }, 100);
      }
      
    } catch (error) {
      console.error('Failed to navigate to search result:', error);
      setNavigatingToResult(null);
    }
  };

  // Handle iframe load errors
  const handleIframeError = () => {
    console.warn('PDF failed to load in iframe, this might be due to browser restrictions');
    setError('PDF preview unavailable. Click "Full View" to open in a new tab.');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setScanResults(null);
      
      // Create preview URL for PDF
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setScanResults(null);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setError('Please drop a PDF file only');
    }
  };

  const handleScanDocument = async () => {
    if (!selectedFile || !searchTerm.trim()) {
      setError('Please select a PDF file and enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('searchTerm', searchTerm.trim());

      const response = await fetch('/api/documents/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();
        setScanResults(results);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan document');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setSearchTerm('');
    setError(null);
    setScanResults(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Compact Header with Controls */}
      <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* File Upload - Compact */}
          <div className="flex items-center gap-3 flex-1">
            {!selectedFile ? (
              <div
                className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Upload PDF</p>
                  <p className="text-xs text-gray-500">Drop file or click</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Search Input - Inline */}
            {selectedFile && (
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter topic to scan for..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && searchTerm.trim() && handleScanDocument()}
                  />
                </div>
                <button
                  onClick={handleScanDocument}
                  disabled={!searchTerm.trim() || loading}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                  {loading ? 'Scanning...' : 'Scan'}
                </button>
              </div>
            )}
          </div>

          {/* Results Summary - Compact */}
          {scanResults && (
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{scanResults.totalMatches}</p>
                  <p className="text-xs text-gray-500">Matches</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">
                    {Math.round((scanResults.results.reduce((acc, r) => acc + r.confidence, 0) / scanResults.results.length) * 100) || 0}%
                  </p>
                  <p className="text-xs text-gray-500">Confidence</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">
                    {new Set(scanResults.results.map(r => r.page)).size}
                  </p>
                  <p className="text-xs text-gray-500">Pages</p>
                </div>
              </div>
              <button
                onClick={resetScanner}
                className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                New Scan
              </button>
            </div>
          )}
        </div>

        {/* Error Message - Compact */}
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Results Panel */}
        {scanResults ? (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 text-sm">Search Results</h3>
              <p className="text-xs text-gray-600 mt-1">
                "{scanResults.searchTerm}" in {scanResults.fileName}
              </p>
              
              {/* Info about highlighting limitations */}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">💡</div>
                  <div>
                    <p className="text-blue-800 font-medium">Navigation Tips:</p>
                    <p className="text-blue-700 mt-1">
                      • Click results to jump to pages
                      • Use "Full View" for better PDF navigation
                      • Browser PDF viewers have limited highlighting support
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {scanResults.results.length > 0 ? (
                <div className="p-2 space-y-2">
                  {scanResults.results.map((result, index) => {
                    const resultId = `${result.page}-${result.confidence}`;
                    const isNavigating = navigatingToResult === resultId;
                    
                    return (
                      <div 
                        key={index} 
                        data-result-index={resultId}
                        className={`p-3 border border-gray-200 rounded-lg transition-colors cursor-pointer group ${
                          isNavigating 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => navigateToSearchResult(result)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Page {result.page}
                          </span>
                          <div className="flex items-center gap-1">
                            {isNavigating && (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-600 mr-1" />
                            )}
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              result.confidence > 0.8 ? 'bg-green-500' : 
                              result.confidence > 0.6 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-xs text-gray-500">
                              {Math.round(result.confidence * 100)}%
                            </span>
                            <ArrowRight className="h-3 w-3 text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                          {result.text}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-blue-600 font-medium">
                            {isNavigating ? 'Navigating to page...' : `Click to navigate to page ${result.page} →`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">💡 Use "Full View" button for better PDF navigation</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">No matches found</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Initial Instructions Panel */
          selectedFile && !loading && (
            <div className="w-80 bg-blue-50 border-r border-blue-200 flex flex-col items-center justify-center p-4 flex-shrink-0">
              <div className="text-center">
                <Highlighter className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Ready to Scan</h3>
                <p className="text-blue-700 text-xs mb-3">
                  Enter a search term above and click "Scan" to find relevant sections.
                </p>
                <div className="bg-white rounded-lg p-3 text-left">
                  <h4 className="font-medium text-gray-900 mb-2 text-xs">Example searches:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• "DEI policy"</li>
                    <li>• "financial controls"</li>
                    <li>• "risk assessment"</li>
                    <li>• "audit findings"</li>
                    <li>• "compliance"</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        )}

        {/* PDF Preview Panel - Takes all remaining space */}
        <div className="flex-1 bg-gray-50 flex flex-col min-w-0">
          {selectedFile && previewUrl ? (
            <>
              <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-gray-900 text-sm">Document Preview</h3>
                {scanResults && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => window.open(scanResults.documentUrl, '_blank')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      Full View
                    </button>
                    <a
                      href={scanResults.documentUrl}
                      download={scanResults.fileName}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>
                )}
              </div>
              <div className="flex-1 p-2 min-h-0">
                <div className="h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                    onError={handleIframeError}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
                <p className="text-gray-500 mb-3">Upload a PDF to get started with document scanning</p>
                <div className="bg-white rounded-lg p-3 max-w-xs mx-auto border">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">How it works:</h4>
                  <ol className="text-xs text-gray-600 space-y-1 text-left">
                    <li>1. Upload a PDF document</li>
                    <li>2. Enter keywords to search for</li>
                    <li>3. AI finds relevant sections</li>
                    <li>4. Click results to navigate</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner; 