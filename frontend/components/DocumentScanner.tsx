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
  Zap,
  Target,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Predefined topic suggestions
  const topicSuggestions = [
    { label: 'Financial Controls', value: 'financial controls', icon: '💰', description: 'Budget management, expenditure tracking' },
    { label: 'Risk Assessment', value: 'risk assessment', icon: '⚠️', description: 'Identified risks and mitigation strategies' },
    { label: 'Compliance Issues', value: 'compliance', icon: '✅', description: 'Regulatory compliance and violations' },
    { label: 'Audit Findings', value: 'audit findings', icon: '🔍', description: 'Key audit results and recommendations' },
    { label: 'DEI Policy', value: 'DEI policy', icon: '🤝', description: 'Diversity, equity and inclusion policies' },
    { label: 'Governance Structure', value: 'governance', icon: '🏛️', description: 'Organizational governance frameworks' },
    { label: 'Performance Metrics', value: 'performance metrics', icon: '📊', description: 'KPIs and performance indicators' },
    { label: 'Strategic Objectives', value: 'strategic objectives', icon: '🎯', description: 'Long-term goals and initiatives' }
  ];

  // Function to navigate to specific page and highlight text
  const navigateToSearchResult = async (result: SearchResult) => {
    if (!scanResults) return;
    
    const resultId = `${result.page}-${result.confidence}`;
    setNavigatingToResult(resultId);
    
    try {
      const encodedText = encodeURIComponent(result.text.slice(0, 50));
      const timestamp = Date.now();
      const pdfUrl = `${scanResults.documentUrl}#page=${result.page}&search=${encodedText}&t=${timestamp}`;
      
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = pdfUrl;
          }
          setTimeout(() => setNavigatingToResult(null), 500);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to navigate to search result:', error);
      setNavigatingToResult(null);
    }
  };

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
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setScanResults(null);
      
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
    setSelectedSuggestion(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSuggestionSelect = (suggestion: typeof topicSuggestions[0]) => {
    setSearchTerm(suggestion.value);
    setSelectedSuggestion(suggestion.value);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Enhanced Header Section */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-6 flex-shrink-0">
        <div className="space-y-4">
          {/* Main Title and Description */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-light text-white italic">Strategic Topic Scanner</h1>
                <p className="text-white/80 text-lg font-light">Intelligent document analysis for strategic insights</p>
              </div>
            </div>
          </div>

          {/* File Status and Search Configuration - Only show when file is uploaded */}
          {selectedFile && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* File Status */}
              <div className="flex-1">
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-300/30">
                        <FileText className="h-6 w-6 text-green-200" />
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-white">{selectedFile.name}</h3>
                        <p className="text-white/70">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB • Ready for analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Configuration */}
              <div className="flex-1 space-y-4">
                {/* Search Input */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Search className="h-5 w-5 text-white/80" />
                    <h3 className="text-lg font-light text-white">Define Search Topic</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setSelectedSuggestion(null);
                        }}
                        placeholder="Enter topic to scan for..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                        disabled={loading}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && searchTerm.trim() && handleScanDocument()}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedSuggestion(null);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Topic Suggestions */}
                    <div>
                      <button
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-3"
                      >
                        <Sparkles className="h-4 w-4" />
                        Quick Topic Suggestions
                        {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {showAdvancedOptions && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {topicSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors border ${
                                selectedSuggestion === suggestion.value
                                  ? 'bg-white/20 border-white/40 text-white'
                                  : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <span className="text-lg">{suggestion.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{suggestion.label}</p>
                                <p className="text-xs opacity-70 truncate">{suggestion.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Scan Button */}
                    <button
                      onClick={handleScanDocument}
                      disabled={!searchTerm.trim() || loading}
                      className="w-full flex items-center justify-center gap-3 bg-[#EDE5D4] text-[#173559] py-4 px-6 rounded-lg hover:bg-[#E0D5C7] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analyzing Document...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Begin Strategic Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {scanResults && (
            <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-xl p-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-300/30">
                      <Check className="h-5 w-5 text-green-200" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white">Analysis Complete</h3>
                      <p className="text-white/70 text-sm">Found insights for "{scanResults.searchTerm}"</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <p className="text-2xl font-light text-white">{scanResults.totalMatches}</p>
                      <p className="text-xs text-white/70 italic">Total Matches</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <p className="text-2xl font-light text-white">
                        {Math.round((scanResults.results.reduce((acc, r) => acc + r.confidence, 0) / scanResults.results.length) * 100) || 0}%
                      </p>
                      <p className="text-xs text-white/70 italic">Avg Confidence</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <p className="text-2xl font-light text-white">
                        {new Set(scanResults.results.map(r => r.page)).size}
                      </p>
                      <p className="text-xs text-white/70 italic">Pages Found</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={resetScanner}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/30"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Analysis
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-300/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-200 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Enhanced Results Panel */}
        {scanResults ? (
          <div className="w-96 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-white/20 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6 text-white/80" />
                <h3 className="text-xl font-light text-white italic">Strategic Insights</h3>
              </div>
              <p className="text-white/70 mb-4">
                Analyzing "{scanResults.searchTerm}" in <span className="text-white font-medium">{scanResults.fileName}</span>
              </p>
              
              {/* Enhanced Navigation Tips */}
              <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-400/20 rounded-lg">
                    <Highlighter className="h-4 w-4 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="text-blue-200 font-medium mb-2">Navigation Guide</h4>
                    <ul className="text-blue-200/80 text-sm space-y-1">
                      <li>• Click results to jump to specific pages</li>
                      <li>• Use "Full View" for enhanced PDF navigation</li>
                      <li>• Higher confidence scores indicate stronger matches</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {scanResults.results.length > 0 ? (
                <div className="p-4 space-y-3">
                  {scanResults.results.map((result, index) => {
                    const resultId = `${result.page}-${result.confidence}`;
                    const isNavigating = navigatingToResult === resultId;
                    const confidenceLevel = result.confidence > 0.8 ? 'high' : result.confidence > 0.6 ? 'medium' : 'low';
                    
                    return (
                      <div 
                        key={index} 
                        data-result-index={resultId}
                        className={`border border-white/20 rounded-xl transition-all duration-300 cursor-pointer group ${
                          isNavigating 
                            ? 'bg-blue-500/20 border-blue-300/40 shadow-lg' 
                            : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 hover:shadow-lg hover:-translate-y-1'
                        }`}
                        onClick={() => navigateToSearchResult(result)}
                      >
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-300/30">
                                Page {result.page}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  confidenceLevel === 'high' ? 'bg-green-400' : 
                                  confidenceLevel === 'medium' ? 'bg-yellow-400' : 'bg-orange-400'
                                }`} />
                                <span className="text-xs text-white/70 font-medium">
                                  {Math.round(result.confidence * 100)}% match
                                </span>
                              </div>
                            </div>
                            {isNavigating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            )}
                          </div>
                          
                          <p className="text-white/90 leading-relaxed font-light mb-3 line-clamp-4">
                            {result.text}
                          </p>
                          
                          <div className="pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                confidenceLevel === 'high' ? 'bg-green-500/20 text-green-200 border border-green-300/30' :
                                confidenceLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-300/30' :
                                'bg-orange-500/20 text-orange-200 border border-orange-300/30'
                              }`}>
                                {confidenceLevel} relevance
                              </div>
                              <span className="text-white/60">
                                {isNavigating ? 'Navigating...' : 'Click to view'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center">
                    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-4">
                      <Search className="h-12 w-12 text-white/60 mx-auto mb-3" />
                      <h3 className="text-lg font-light text-white mb-2">No Strategic Insights Found</h3>
                      <p className="text-white/70 text-sm">Try refining your search term or selecting a different topic suggestion.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Enhanced Instructions Panel */
          selectedFile && !loading && (
            <div className="w-96 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col items-center justify-center p-8 flex-shrink-0">
              <div className="text-center max-w-sm">
                <div className="p-6 bg-white/15 backdrop-blur-lg rounded-2xl border border-white/30 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full inline-flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-3 italic">Ready for Analysis</h3>
                  <p className="text-white/70 font-light mb-4">
                    Configure your search parameters and begin intelligent document analysis for strategic insights.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left">
                  <h4 className="font-medium text-white mb-3 text-center italic">Analysis Capabilities</h4>
                  <div className="space-y-3 text-sm text-white/80 font-light">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎯</span>
                      <span>Strategic theme identification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💡</span>
                      <span>Key insight extraction</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📊</span>
                      <span>Confidence scoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔍</span>
                      <span>Context-aware search</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Enhanced PDF Preview Panel with Integrated Upload */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm flex flex-col min-w-0">
          {selectedFile && previewUrl ? (
            <>
              <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-white/80" />
                  <h3 className="font-light text-white text-lg italic">Document Preview</h3>
                  {scanResults && (
                    <span className="text-sm text-white/70">• {scanResults.fileName}</span>
                  )}
                </div>
                {scanResults && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open(scanResults.documentUrl, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-[#EDE5D4] text-[#173559] rounded-lg hover:bg-[#E0D5C7] transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      Full View
                    </button>
                    <a
                      href={scanResults.documentUrl}
                      download={scanResults.fileName}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/30 font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 min-h-0">
                <div className="h-full border border-white/30 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-2xl">
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
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
                  <div className="p-6 bg-white/15 backdrop-blur-sm rounded-2xl inline-flex items-center justify-center mb-6">
                    <FileText className="h-16 w-16 text-white/80" />
                  </div>
                  <h2 className="text-4xl font-light text-white mb-4 italic">Strategic Topic Scanner</h2>
                  <p className="text-white/70 text-lg mb-8 font-light leading-relaxed">
                    Upload a PDF document to begin intelligent topic scanning and strategic analysis powered by advanced AI
                  </p>

                  {/* Integrated Upload Area */}
                  <div
                    className="border-2 border-dashed border-white/30 rounded-2xl p-8 cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all duration-300 bg-white/10 backdrop-blur-sm group mb-8"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-light text-white mb-2">Upload PDF Document</h3>
                      <p className="text-white/70 mb-4">Drop your PDF file here or click to browse</p>
                      <div className="text-sm text-white/60 space-y-1">
                        <p>• PDF files only • Maximum size: 10MB</p>
                        <p>• Secure processing • Enterprise-grade analysis</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                      <div className="p-3 bg-[#EDE5D4]/20 rounded-xl inline-flex items-center justify-center mb-4">
                        <span className="text-2xl">📄</span>
                      </div>
                      <h3 className="font-medium text-white mb-2">Document Upload</h3>
                      <p className="text-white/70 text-sm">Secure PDF processing with enterprise-grade analysis</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                      <div className="p-3 bg-[#EDE5D4]/20 rounded-xl inline-flex items-center justify-center mb-4">
                        <span className="text-2xl">🧠</span>
                      </div>
                      <h3 className="font-medium text-white mb-2">AI Analysis</h3>
                      <p className="text-white/70 text-sm">Advanced semantic search with strategic context</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-white/60 italic">
                      <Sparkles className="h-4 w-4" />
                      <span>Powered by Blackwood Analytics Intelligence</span>
                    </div>
                  </div>
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