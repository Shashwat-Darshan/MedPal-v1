
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, Activity, Droplets, Moon, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '@/components/Navbar';

const HealthMonitor = () => {
  const [metrics, setMetrics] = useState({
    heartRate: '',
    bloodPressure: { systolic: '', diastolic: '' },
    weight: '',
    sleep: '',
    water: '',
    steps: '',
  });

  // Sample data for charts
  const heartRateData = [
    { date: '06/08', value: 72 },
    { date: '06/09', value: 75 },
    { date: '06/10', value: 69 },
    { date: '06/11', value: 74 },
    { date: '06/12', value: 71 },
    { date: '06/13', value: 73 },
  ];

  const sleepData = [
    { date: '06/08', hours: 7.5 },
    { date: '06/09', hours: 8.2 },
    { date: '06/10', hours: 6.8 },
    { date: '06/11', hours: 7.9 },
    { date: '06/12', hours: 8.1 },
    { date: '06/13', hours: 7.6 },
  ];

  const stepsData = [
    { date: '06/08', steps: 8420 },
    { date: '06/09', steps: 9150 },
    { date: '06/10', steps: 7890 },
    { date: '06/11', steps: 10200 },
    { date: '06/12', steps: 8950 },
    { date: '06/13', steps: 8432 },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setMetrics(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setMetrics(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    console.log('Saving metrics:', metrics);
    // Reset form
    setMetrics({
      heartRate: '',
      bloodPressure: { systolic: '', diastolic: '' },
      weight: '',
      sleep: '',
      water: '',
      steps: '',
    });
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getHealthStatus = (value: number, type: string) => {
    switch (type) {
      case 'heartRate':
        if (value >= 60 && value <= 100) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
        return { status: 'Check', color: 'bg-yellow-100 text-yellow-800' };
      case 'sleep':
        if (value >= 7 && value <= 9) return { status: 'Good', color: 'bg-green-100 text-green-800' };
        return { status: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800' };
      case 'steps':
        if (value >= 8000) return { status: 'Active', color: 'bg-green-100 text-green-800' };
        return { status: 'Low Activity', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { status: 'Normal', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
              <p className="text-sm text-purple-600">Track and monitor your health metrics</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metrics Input */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <span>Log Today's Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={metrics.heartRate}
                      onChange={(e) => handleInputChange('heartRate', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="systolic">Systolic BP</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={metrics.bloodPressure.systolic}
                        onChange={(e) => handleInputChange('bloodPressure.systolic', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic BP</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={metrics.bloodPressure.diastolic}
                        onChange={(e) => handleInputChange('bloodPressure.diastolic', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={metrics.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sleep">Sleep Hours</Label>
                    <Input
                      id="sleep"
                      type="number"
                      step="0.1"
                      placeholder="8.0"
                      value={metrics.sleep}
                      onChange={(e) => handleInputChange('sleep', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="water">Water Intake (glasses)</Label>
                    <Input
                      id="water"
                      type="number"
                      placeholder="8"
                      value={metrics.water}
                      onChange={(e) => handleInputChange('water', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="steps">Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      placeholder="8000"
                      value={metrics.steps}
                      onChange={(e) => handleInputChange('steps', e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Log Metrics
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Heart Rate</p>
                      <p className="text-2xl font-bold text-gray-900">73 bpm</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-8 w-8 text-red-500" />
                      {getTrendIcon(73, 71)}
                    </div>
                  </div>
                  <Badge className={getHealthStatus(73, 'heartRate').color}>
                    {getHealthStatus(73, 'heartRate').status}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sleep</p>
                      <p className="text-2xl font-bold text-gray-900">7.6 hrs</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Moon className="h-8 w-8 text-blue-500" />
                      {getTrendIcon(7.6, 8.1)}
                    </div>
                  </div>
                  <Badge className={getHealthStatus(7.6, 'sleep').color}>
                    {getHealthStatus(7.6, 'sleep').status}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Steps</p>
                      <p className="text-2xl font-bold text-gray-900">8,432</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-8 w-8 text-green-500" />
                      {getTrendIcon(8432, 8950)}
                    </div>
                  </div>
                  <Badge className={getHealthStatus(8432, 'steps').color}>
                    {getHealthStatus(8432, 'steps').status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="heartRate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
                    <TabsTrigger value="sleep">Sleep</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="heartRate" className="mt-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={heartRateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sleep" className="mt-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sleepData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="steps" className="mt-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stepsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="steps" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Water Intake</span>
                    <span>6/8 glasses</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Steps</span>
                    <span>8,432/10,000</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sleep Goal</span>
                    <span>7.6/8.0 hours</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthMonitor;
