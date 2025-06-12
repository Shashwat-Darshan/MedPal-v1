
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Heart, Thermometer, Scale } from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  lastUpdated: Date;
}

const HealthMonitor = () => {
  const navigate = useNavigate();
  
  const [metrics] = useState<HealthMetric[]>([
    {
      id: '1',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'normal',
      icon: Heart,
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'Body Temperature',
      value: 98.6,
      unit: '°F',
      status: 'normal',
      icon: Thermometer,
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'BMI',
      value: 23.5,
      unit: 'kg/m²',
      status: 'normal',
      icon: Scale,
      lastUpdated: new Date()
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const healthScore = 95; // Mock health score

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
                <p className="text-sm text-orange-600">Track your vital signs and health metrics</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Heart className="h-6 w-6" />
              <span>Overall Health Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-green-800">{healthScore}%</span>
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
                <Progress value={healthScore} className="h-3" />
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <p className="text-green-700 mt-3 text-sm">
              Your health metrics are looking great! Keep up the good work with your health routine.
            </p>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-5 w-5 text-gray-600" />
                    <span className="text-lg">{metric.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-lg text-gray-600 ml-1">{metric.unit}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(metric.status)}`}
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Last updated: {metric.lastUpdated.toLocaleTimeString()}
                  </p>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Update Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Heart className="h-6 w-6" />
                <span>Record Heart Rate</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Thermometer className="h-6 w-6" />
                <span>Log Temperature</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Scale className="h-6 w-6" />
                <span>Update Weight</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Activity className="h-6 w-6" />
                <span>Log Symptoms</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HealthMonitor;
