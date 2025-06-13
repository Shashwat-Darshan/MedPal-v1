
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, MessageSquare, Calendar, TrendingUp, Heart, Clock, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from an API
  const recentConsultations = [
    { id: '1', date: '2025-06-13', condition: 'Headache Assessment', confidence: 85 },
    { id: '2', date: '2025-06-12', condition: 'Cold Symptoms', confidence: 92 },
    { id: '3', date: '2025-06-11', condition: 'Allergy Check', confidence: 78 },
  ];

  const healthMetrics = [
    { label: 'Heart Rate', value: '72 bpm', status: 'normal', icon: Heart },
    { label: 'Sleep Quality', value: '7.5 hrs', status: 'good', icon: Clock },
    { label: 'Activity Level', value: '8,432 steps', status: 'active', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's your health overview and recent activity.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/diagnosis')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Diagnosis</h3>
                  <p className="text-sm text-gray-600">Start new consultation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Health Chat</h3>
                  <p className="text-sm text-gray-600">Ask health questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/monitor')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Monitor</h3>
                  <p className="text-sm text-gray-600">Track health metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">History</h3>
                  <p className="text-sm text-gray-600">View past consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{metric.label}</p>
                          <p className="text-sm text-gray-600">{metric.value}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.status === 'normal' || metric.status === 'good' || metric.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metric.status}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-medium text-blue-900 mb-1">Sleep Pattern Analysis</h4>
                    <p className="text-blue-800 text-sm">Your sleep quality has improved by 15% this week. Keep maintaining your bedtime routine.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-medium text-green-900 mb-1">Activity Recommendation</h4>
                    <p className="text-green-800 text-sm">Great job on staying active! Consider adding 10 minutes of stretching to your routine.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Consultations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Consultations</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{consultation.condition}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {consultation.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{consultation.date}</p>
                    <Progress value={consultation.confidence} className="h-1 mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Health Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Health Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-gray-600">Total Consultations</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <p className="text-sm text-gray-600">Average Confidence</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">7</div>
                  <p className="text-sm text-gray-600">Days Active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
