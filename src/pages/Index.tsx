
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Clock, Mic, History, Phone } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState([5]);

  const handleStartDiagnosis = () => {
    if (!symptoms.trim()) return;
    // Here you would start the actual diagnosis flow
    console.log('Starting diagnosis with:', { symptoms, duration, severity: severity[0] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedPal</h1>
                <span className="text-sm text-blue-600 font-medium">AI Healthcare Assistant</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/history')}>
                History
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  U
                </div>
                <span className="text-sm font-medium">User</span>
              </div>
              <Button variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tracker */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic Progress</h3>
              <span className="text-sm text-gray-600">0%</span>
            </div>
            <Progress value={0} className="mb-4" />
            <div className="flex justify-between text-sm">
              <span className="text-blue-600 font-medium">Symptoms</span>
              <span className="text-gray-500">Questions</span>
              <span className="text-gray-500">Results</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Symptom Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Describe Your Symptoms</span>
                </CardTitle>
                <p className="text-gray-600">Tell me about what you're experiencing so I can help with an accurate assessment</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What symptoms are you experiencing?
                  </label>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <Button variant="outline" size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </Button>
                    <span className="text-sm text-gray-500">or type below</span>
                  </div>

                  <Textarea
                    placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="few-hours">Few hours</SelectItem>
                        <SelectItem value="1-day">1 day</SelectItem>
                        <SelectItem value="2-3-days">2-3 days</SelectItem>
                        <SelectItem value="1-week">1 week</SelectItem>
                        <SelectItem value="2-weeks">2+ weeks</SelectItem>
                        <SelectItem value="1-month">1+ month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity (1-10): {severity[0]}
                    </label>
                    <div className="px-3 pt-2">
                      <Slider
                        value={severity}
                        onValueChange={setSeverity}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleStartDiagnosis}
                  disabled={!symptoms.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  Start Diagnosis
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/history')}
                >
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </div>
                  <span className="text-xs text-gray-500">Past consultations</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Emergency Contacts
                  </div>
                  <span className="text-xs text-gray-500">Quick access numbers</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 4, date: 'Jun 14, 2025' },
                  { id: 3, date: 'Jun 13, 2025' },
                  { id: 2, date: 'Jun 12, 2025' }
                ].map((consultation) => (
                  <div key={consultation.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Consultation #{consultation.id}</p>
                      <p className="text-xs text-gray-500">{consultation.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <Alert className="mt-8 bg-orange-50 border-orange-200">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            ⚠️ Important: This is not professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
};

export default Index;
