"use client";
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [selectedImageType, setSelectedImageType] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  useEffect(() => {
    // hydrate from localStorage if present
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mediscan_processed');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.processedData) setProcessedData(parsed.processedData);
          if (parsed?.selectedImageType) setSelectedImageType(parsed.selectedImageType);
        } catch (e) {
          console.warn('Failed to parse persisted processed data');
        }
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ selectedImageType, setSelectedImageType, processedData, setProcessedData }}>
      {children}
    </AppContext.Provider>
  );
};
