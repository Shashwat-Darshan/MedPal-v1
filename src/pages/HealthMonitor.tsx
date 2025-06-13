
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Heart, Activity, Droplets, Moon, Plus, TrendingUp, TrendingDown, Zap, Target, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HealthEducation from '@/components/HealthEducation';

const HealthMonitor = () => {
  const [metrics, setMetrics] = useState({
    heartRate: '',
    bloodPressure: { systolic: '', diastolic: '' },
    weight: '',
    sleep: '',
    water: '',
    steps: '',
  });

  // Enhanced sample data for charts
  const heartRateData = [
    { date: '06/08', value: 72, zone: 'Rest' },
    { date: '06/09', value: 75, zone: 'Rest' },
    { date: '06/10', value: 69, zone: 'Rest' },
    { date: '06/11', value: 74, zone: 'Rest' },
    { date: '06/12', value: 71, zone: 'Rest' },
    { date: '06/13', value: 73, zone: 'Rest' },
  ];

  const sleepData = [
    { date: '06/08', hours: 7.5, deep: 2.1, rem: 1.8, light: 3.6 },
    { date: '06/09', hours: 8.2, deep: 2.3, rem: 2.1, light: 3.8 },
    { date: '06/10', hours: 6.8, deep: 1.8, rem: 1.5, light: 3.5 },
    { date: '06/11', hours: 7.9, deep: 2.2, rem: 1.9, light: 3.8 },
    { date: '06/12', hours: 8.1, deep: 2.4, rem: 2.0, light: 3.7 },
    { date: '06/13', hours: 7.6, deep: 2.1, rem: 1.8, light: 3.7 },
  ];

  const stepsData = [
    { date: '06/08', steps: 8420, calories: 342 },
    { date: '06/09', steps: 9150, calories: 398 },
    { date: '06/10', steps: 7890, calories: 321 },
    { date: '06/11', steps: 10200, calories: 445 },
    { date: '06/12', steps: 8950, calories: 378 },
    { date: '06/13', steps: 8432, calories: 356 },
  ];

  const weeklyProgress = [
    { day: 'Mon', water: 6, exercise: 45, sleep: 7.5 },
    { day: 'Tue', water: 8, exercise: 30, sleep: 8.2 },
    { day: 'Wed', water: 5, exercise: 60, sleep: 6.8 },
    { day: 'Thu', water: 7, exercise: 45, sleep: 7.9 },
    { day: 'Fri', water: 8, exercise: 0, sleep: 8.1 },
    { day: 'Sat', water: 6, exercise: 90, sleep: 7.6 },
    { day: 'Sun', water: 7, exercise: 30, sleep: 8.0 },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setMetrics(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
                <p className="text-sm text-purple-600">Track and monitor your health metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metrics Input */}
          <div className="space-y-6">
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

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Weekly Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#dbeafe" />
                      <Area type="monotone" dataKey="sleep" stackId="2" stroke="#8b5cf6" fill="#ede9fe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
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

              <Card className="hover:shadow-lg transition-shadow">
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

              <Card className="hover:shadow-lg transition-shadow">
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

            {/* Enhanced Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="heartRate" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
                    <TabsTrigger value="sleep">Sleep</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="heartRate" className="mt-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={heartRateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sleep" className="mt-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sleepData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="deep" stackId="1" stroke="#1e40af" fill="#3b82f6" />
                          <Area type="monotone" dataKey="rem" stackId="1" stroke="#7c3aed" fill="#8b5cf6" />
                          <Area type="monotone" dataKey="light" stackId="1" stroke="#06b6d4" fill="#0891b2" />
                        </AreaChart>
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
                          <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Energy Level</h4>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">High</div>
                        <p className="text-sm text-blue-600">Based on activity and sleep</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-900">Cardiovascular</h4>
                        </div>
                        <div className="text-2xl font-bold text-green-700">Excellent</div>
                        <p className="text-sm text-green-600">Heart rate variability optimal</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>Water Intake</span>
                    </span>
                    <span>6/8 glasses</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Steps</span>
                    </span>
                    <span>8,432/10,000</span>
                  </div>
                  <Progress value={84} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center space-x-2">
                      <Moon className="h-4 w-4 text-purple-500" />
                      <span>Sleep Goal</span>
                    </span>
                    <span>7.6/8.0 hours</span>
                  </div>
                  <Progress value={95} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span>Active Minutes</span>
                    </span>
                    <span>45/60 minutes</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Health Education */}
            <HealthEducation />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthMonitor;
