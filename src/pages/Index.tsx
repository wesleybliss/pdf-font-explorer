import React, { useState } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { FontList, FontInfo } from '@/components/FontList';
import { extractFontsFromPDF } from '@/lib/pdfUtils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileText, Zap } from 'lucide-react';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFonts([]); // Clear previous results
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const extractedFonts = await extractFontsFromPDF(selectedFile);
      setFonts(extractedFonts);
      toast({
        title: "Analysis Complete",
        description: `Found ${extractedFonts.length} fonts in the PDF`,
      });
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDF Font Analyzer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a PDF file to analyze and discover all fonts used in the document. 
            Identify embedded and non-embedded fonts with detailed information.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <PDFUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            isProcessing={isProcessing}
          />

          {selectedFile && (
            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={isProcessing}
                size="lg"
                className="shadow-medium hover:shadow-glow transition-all duration-200"
              >
                <Zap className="mr-2 h-5 w-5" />
                {isProcessing ? 'Analyzing...' : 'Analyze Fonts'}
              </Button>
            </div>
          )}

          {/* Results Section */}
          {(fonts.length > 0 || isProcessing) && (
            <FontList fonts={fonts} isLoading={isProcessing} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by PDF.js • Analyze font usage and embedding status in PDF documents
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
