import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ 
  onFileSelect, 
  selectedFile, 
  isProcessing 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  const clearFile = () => {
    onFileSelect(null as any);
  };

  return (
    <Card className="p-8">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragActive 
              ? 'border-primary bg-gradient-tech shadow-glow' 
              : 'border-border hover:border-primary hover:bg-gradient-tech/50'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {isDragActive ? 'Drop the PDF here' : 'Upload PDF File'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop a PDF file here, or click to browse
          </p>
          <Button variant="outline" disabled={isProcessing}>
            Choose File
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-6 bg-gradient-tech rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h4 className="font-semibold">{selectedFile.name}</h4>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={isProcessing}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};