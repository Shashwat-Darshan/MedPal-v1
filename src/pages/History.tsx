
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

interface HistoryItem {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  confidence: number;
  status: 'completed' | 'pending';
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Get user-specific history from localStorage
  const getUserHistory = (): HistoryItem[] => {
    if (!user?.email) return [];
    
    const storageKey = `medpal_history_${user.email}`;
    const storedHistory = localStorage.getItem(storageKey);
    
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        return parsed.map((item: any) => ({
          ...item,
          date: item.date // Keep as string for consistent display
        }));
      } catch (error) {
        console.error('Error parsing user history:', error);
        return [];
      }
    }
    
    return [];
  };

  // Load history on component mount and when user changes
  useEffect(() => {
    const userHistory = getUserHistory();
    setHistory(userHistory);
  }, [user?.email]);

  // Listen for storage changes (when new history is added)
  useEffect(() => {
    const handleStorageChange = () => {
      const userHistory = getUserHistory();
      setHistory(userHistory);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user?.email]);

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      };
    } catch (error) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consultation History</h1>
              <p className="text-sm text-purple-600">Your previous AI consultations</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultation history</h3>
              <p className="text-gray-600 mb-6">Start your first AI diagnosis to see your history here.</p>
              <Button onClick={() => navigate('/diagnosis')} className="bg-purple-600 hover:bg-purple-700">
                Start New Consultation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Consultations ({history.length})</h2>
              <Button onClick={() => navigate('/diagnosis')} className="bg-purple-600 hover:bg-purple-700">
                New Consultation
              </Button>
            </div>

            {history.map((item) => {
              const { date, time } = formatDate(item.date);
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.diagnosis}</CardTitle>
                      <Badge className={getConfidenceBadgeColor(item.confidence)}>
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Symptoms Reported:</h4>
                        <p className="text-gray-700 text-sm">{item.symptoms}</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <Badge variant={item.status === 'completed' ? 'secondary' : 'outline'}>
                          {item.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
