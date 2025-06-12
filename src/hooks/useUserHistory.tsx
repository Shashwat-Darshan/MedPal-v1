
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface HistoryItem {
  id: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  confidence: number;
  status: 'completed' | 'pending';
}

export const useUserHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const getStorageKey = () => `medpal_history_${user?.email || 'anonymous'}`;

  const loadHistory = () => {
    if (!user?.email) {
      setHistory([]);
      return;
    }

    const storageKey = getStorageKey();
    const storedHistory = localStorage.getItem(storageKey);
    
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Error parsing user history:', error);
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'date'>) => {
    if (!user?.email) return;

    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date()
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);

    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (!user?.email) return;

    setHistory([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  useEffect(() => {
    loadHistory();
  }, [user?.email]);

  return {
    history,
    addHistoryItem,
    clearHistory,
    loadHistory
  };
};
