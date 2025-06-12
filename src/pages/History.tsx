
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HistoryItem {
  id: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  confidence: number;
  status: 'completed' | 'pending';
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          date: new Date(item.date)
        }));
      } catch (error) {
        console.error('Error parsing user history:', error);
        return [];
      }
    }
    
    return [];
  };

  const history = getUserHistory();

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultation History</h1>
                <p className="text-sm text-purple-600">Your previous AI consultations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h2 className="text-xl font-semibold text-gray-900">Your Consultations</h2>
              <Button onClick={() => navigate('/diagnosis')} className="bg-purple-600 hover:bg-purple-700">
                New Consultation
              </Button>
            </div>

            {history.map((item) => (
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
                      <span>{item.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{item.date.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Symptoms Reported:</h4>
                      <p className="text-gray-700">{item.symptoms}</p>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
