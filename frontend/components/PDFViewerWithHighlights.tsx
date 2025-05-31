'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

// Extend Window interface for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

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

interface PDFViewerWithHighlightsProps {
  pdfUrl: string;
  searchResults?: SearchResult[];
  searchTerm?: string;
  onPageChange?: (page: number) => void;
  onTextSelect?: (text: string, page: number) => void;
}

const PDFViewerWithHighlights: React.FC<PDFViewerWithHighlightsProps> = ({
  pdfUrl,
  searchResults = [],
  searchTerm = '',
  onPageChange,
  onTextSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF.js library dynamically
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        // Load PDF.js from CDN
        if (typeof window !== 'undefined' && !window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Set worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Load the PDF document
        if (window.pdfjsLib && pdfUrl) {
          const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDFJS();
  }, [pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas!.getContext('2d');
        
        const viewport = page.getViewport({ scale });
        canvas!.height = viewport.height;
        canvas!.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Highlight search results on this page
        highlightSearchResults(context!, viewport, currentPage);
        
        if (onPageChange) {
          onPageChange(currentPage);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, searchResults]);

  // Function to highlight search results
  const highlightSearchResults = (context: CanvasRenderingContext2D, viewport: any, pageNum: number) => {
    const pageResults = searchResults.filter(result => result.page === pageNum);
    
    pageResults.forEach(result => {
      // Convert PDF coordinates to canvas coordinates
      const canvasX = result.position.x * scale;
      const canvasY = viewport.height - (result.position.y * scale) - (result.position.height * scale);
      const canvasWidth = result.position.width * scale;
      const canvasHeight = result.position.height * scale;

      // Draw highlight rectangle
      context.save();
      context.globalAlpha = 0.3;
      context.fillStyle = result.confidence > 0.8 ? '#22c55e' : 
                         result.confidence > 0.6 ? '#eab308' : '#ef4444';
      context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
      
      // Draw border
      context.globalAlpha = 0.8;
      context.strokeStyle = result.confidence > 0.8 ? '#16a34a' : 
                          result.confidence > 0.6 ? '#ca8a04' : '#dc2626';
      context.lineWidth = 2;
      context.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
      context.restore();
    });
  };

  // Navigate to a specific search result
  const navigateToResult = (result: SearchResult) => {
    setCurrentPage(result.page);
    
    // Scroll to the result position after a brief delay to allow page render
    setTimeout(() => {
      if (containerRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Calculate scroll position
        const canvasY = canvas.height - (result.position.y * scale) - (result.position.height * scale);
        const targetScrollTop = canvasY - container.clientHeight / 2;
        
        container.scrollTop = Math.max(0, targetScrollTop);
      }
    }, 100);
  };

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading PDF</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-700 min-w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-200 p-4"
      >
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 shadow-lg bg-white"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Search Results Navigation */}
      {searchResults.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-3 max-h-32 overflow-y-auto flex-shrink-0">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Search Results for "{searchTerm}"
          </h4>
          <div className="flex flex-wrap gap-1">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => navigateToResult(result)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  result.page === currentPage
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Page {result.page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewerWithHighlights; 