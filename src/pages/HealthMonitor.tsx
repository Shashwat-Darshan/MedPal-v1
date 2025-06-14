
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, Activity, Droplets, Moon, TrendingUp, Calendar, Plus, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HealthGoals from '@/components/HealthGoals';
import EmergencyContacts from '@/components/EmergencyContacts';
import HealthInsights from '@/components/HealthInsights';

const HealthMonitor = () => {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');

  // Sample health data
  const healthMetrics = {
    heartRate: {
      current: 72,
      trend: 'stable',
      data: [
        { time: '00:00', value: 68 },
        { time: '04:00', value: 65 },
        { time: '08:00', value: 72 },
        { time: '12:00', value: 75 },
        { time: '16:00', value: 78 },
        { time: '20:00', value: 70 }
      ]
    },
    bloodPressure: {
      current: '120/80',
      trend: 'good',
      data: [
        { time: 'Mon', systolic: 118, diastolic: 78 },
        { time: 'Tue', systolic: 122, diastolic: 80 },
        { time: 'Wed', systolic: 120, diastolic: 79 },
        { time: 'Thu', systolic: 119, diastolic: 81 },
        { time: 'Fri', systolic: 121, diastolic: 80 },
        { time: 'Sat', systolic: 120, diastolic: 80 },
        { time: 'Sun', systolic: 118, diastolic: 78 }
      ]
    },
    sleep: {
      current: 7.5,
      trend: 'improving',
      data: [
        { date: 'Mon', hours: 7.2, quality: 85 },
        { date: 'Tue', hours: 6.8, quality: 75 },
        { date: 'Wed', hours: 7.5, quality: 90 },
        { date: 'Thu', hours: 8.0, quality: 95 },
        { date: 'Fri', hours: 7.3, quality: 80 },
        { date: 'Sat', hours: 8.2, quality: 92 },
        { date: 'Sun', hours: 7.5, quality: 88 }
      ]
    },
    hydration: {
      current: 6,
      target: 8,
      trend: 'needs improvement'
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': case 'good': return 'text-blue-600';
      case 'needs improvement': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4" />;
      case 'stable': case 'good': return <Activity className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Monitor</h1>
          <p className="text-gray-600">Track your vital signs and health metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Signs Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMetric('heartRate')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Heart Rate</p>
                      <p className="text-2xl font-bold">{healthMetrics.heartRate.current} BPM</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-500" />
                  </div>
                  <div className={`flex items-center mt-2 ${getTrendColor(healthMetrics.heartRate.trend)}`}>
                    {getTrendIcon(healthMetrics.heartRate.trend)}
                    <span className="text-xs ml-1 capitalize">{healthMetrics.heartRate.trend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMetric('bloodPressure')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                      <p className="text-2xl font-bold">{healthMetrics.bloodPressure.current}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className={`flex items-center mt-2 ${getTrendColor(healthMetrics.bloodPressure.trend)}`}>
                    {getTrendIcon(healthMetrics.bloodPressure.trend)}
                    <span className="text-xs ml-1 capitalize">{healthMetrics.bloodPressure.trend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMetric('sleep')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sleep</p>
                      <p className="text-2xl font-bold">{healthMetrics.sleep.current}h</p>
                    </div>
                    <Moon className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className={`flex items-center mt-2 ${getTrendColor(healthMetrics.sleep.trend)}`}>
                    {getTrendIcon(healthMetrics.sleep.trend)}
                    <span className="text-xs ml-1 capitalize">{healthMetrics.sleep.trend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMetric('hydration')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Hydration</p>
                      <p className="text-2xl font-bold">{healthMetrics.hydration.current}/{healthMetrics.hydration.target}</p>
                    </div>
                    <Droplets className="h-8 w-8 text-cyan-500" />
                  </div>
                  <div className={`flex items-center mt-2 ${getTrendColor(healthMetrics.hydration.trend)}`}>
                    {getTrendIcon(healthMetrics.hydration.trend)}
                    <span className="text-xs ml-1 capitalize">{healthMetrics.hydration.trend}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Detailed Analysis - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</span>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 7 Days
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedMetric === 'heartRate' && (
                      <LineChart data={healthMetrics.heartRate.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    )}
                    {selectedMetric === 'bloodPressure' && (
                      <LineChart data={healthMetrics.bloodPressure.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} name="Systolic" />
                        <Line type="monotone" dataKey="diastolic" stroke="#06b6d4" strokeWidth={2} name="Diastolic" />
                      </LineChart>
                    )}
                    {selectedMetric === 'sleep' && (
                      <BarChart data={healthMetrics.sleep.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#8b5cf6" />
                      </BarChart>
                    )}
                    {selectedMetric === 'hydration' && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="mb-4">
                            <Droplets className="h-16 w-16 text-cyan-500 mx-auto" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">Daily Hydration</h3>
                          <Progress 
                            value={(healthMetrics.hydration.current / healthMetrics.hydration.target) * 100} 
                            className="w-64 h-3"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            {healthMetrics.hydration.current} of {healthMetrics.hydration.target} glasses
                          </p>
                          <Button className="mt-4" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Log Water
                          </Button>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Goals */}
            <HealthGoals />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <EmergencyContacts />

            {/* AI Health Insights */}
            <HealthInsights />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Symptoms
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Checkup
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthMonitor;
