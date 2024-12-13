// src/features/poem-analyzer/hooks/usePoemFile.ts

import { useState } from 'react';
import { Poem, parsePoemFromText } from '../types/poem';

export const usePoemFile = () => {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/plain') {
      setError('Please upload only .txt files');
      return;
    }

    try {
      const text = await file.text();
      const parsedPoem = parsePoemFromText(text);
      setPoem(parsedPoem);
      setIsFileUploaded(true);
      setError('');
    } catch {
      setError('Error reading file');
    }
  };

  const resetPoem = () => {
    setIsFileUploaded(false);
    setPoem(null);
  };

  return {
    poem,
    isFileUploaded,
    error,
    handleFileUpload,
    resetPoem
  };
};