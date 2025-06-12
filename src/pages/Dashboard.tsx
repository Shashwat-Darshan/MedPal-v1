
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageSquare, History, Brain, Stethoscope, Activity, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const features = [
    {
      title: "AI Diagnosis",
      description: "Get AI-powered health analysis based on your symptoms",
      icon: Brain,
      action: () => navigate('/diagnosis'),
      color: "bg-blue-500"
    },
    {
      title: "Health Chat",
      description: "Chat with our AI assistant about health concerns",
      icon: MessageSquare,
      action: () => navigate('/chat'),
      color: "bg-green-500"
    },
    {
      title: "Consultation History",
      description: "View your previous consultations and diagnoses",
      icon: History,
      action: () => navigate('/history'),
      color: "bg-purple-500"
    },
    {
      title: "Health Monitor",
      description: "Track your health metrics and symptoms over time",
      icon: Activity,
      action: () => navigate('/monitor'),
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { label: "Total Consultations", value: "0", icon: Stethoscope },
    { label: "Health Score", value: "95%", icon: Heart },
    { label: "Active Monitoring", value: "3", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MedPal Dashboard</h1>
                <p className="text-blue-600 font-medium">Your AI Health Companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button 
                onClick={() => navigate('/diagnosis')}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Quick Diagnosis
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">How can we help you with your health today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={feature.action}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`${feature.color} p-2 rounded-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    feature.action();
                  }}
                  className="w-full"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">💡 Health Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Stay hydrated! Drinking adequate water helps your body function optimally and can prevent many health issues.
              Aim for at least 8 glasses of water per day.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
