'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface ModelContextType {
  selectedModel: 'Google Gemini' | 'Claude Sonnet';
  setSelectedModel: (model: 'Google Gemini' | 'Claude Sonnet') => void;
}

// Create the context with a default value
const ModelContext = createContext<ModelContextType | undefined>(undefined);

// Create a provider component
export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<
    'Google Gemini' | 'Claude Sonnet'
  >('Google Gemini');

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}

// Create a custom hook to use the context
export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
