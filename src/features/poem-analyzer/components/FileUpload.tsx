// src/features/poem-analyzer/components/FileUpload.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <label className="block mb-4">
          <span className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
            Upload Poem (txt only)
          </span>
          <input
            type="file"
            accept=".txt"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};