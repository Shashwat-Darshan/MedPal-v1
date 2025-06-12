
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Heart, Activity, MessageSquare, History, Monitor, Stethoscope, 
  TrendingUp, Calendar, Bell, Users, Award, BookOpen, 
  Shield, Clock, Thermometer, Pill
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const healthMetrics = [
    { label: 'Heart Rate', value: '72 BPM', status: 'normal', icon: Heart, color: 'text-green-600' },
    { label: 'Blood Pressure', value: '120/80', status: 'optimal', icon: Activity, color: 'text-blue-600' },
    { label: 'Temperature', value: '98.6°F', status: 'normal', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Sleep Quality', value: '8.2/10', status: 'excellent', icon: Clock, color: 'text-purple-600' },
  ];

  const recentActivities = [
    { type: 'diagnosis', title: 'Completed health consultation', time: '2 hours ago', icon: Stethoscope, status: 'completed' },
    { type: 'chat', title: 'Asked about nutrition guidance', time: '4 hours ago', icon: MessageSquare, status: 'completed' },
    { type: 'monitor', title: 'Logged daily health metrics', time: '6 hours ago', icon: Monitor, status: 'completed' },
    { type: 'reminder', title: 'Medication reminder set', time: '1 day ago', icon: Pill, status: 'active' },
    { type: 'checkup', title: 'Scheduled annual check-up', time: '2 days ago', icon: Calendar, status: 'scheduled' },
  ];

  const healthInsights = [
    {
      title: 'Exercise Recommendation',
      description: 'Based on your recent activity, consider adding 20 minutes of cardio 3x per week.',
      type: 'fitness',
      priority: 'medium'
    },
    {
      title: 'Sleep Pattern Analysis',
      description: 'Your sleep quality has improved by 15% this week. Keep up the good routine!',
      type: 'sleep',
      priority: 'low'
    },
    {
      title: 'Hydration Reminder',
      description: 'You\'ve been drinking less water lately. Aim for 8 glasses daily.',
      type: 'nutrition',
      priority: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="medical-gradient rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Good morning, {user?.name || 'User'}! 👋
              </h2>
              <p className="text-muted-foreground text-lg">
                Your health dashboard shows everything is looking great. How are you feeling today?
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">7</div>
                <div className="text-sm text-muted-foreground">Days Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {metric.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/diagnosis')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <span>AI Diagnosis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Describe your symptoms and get AI-powered diagnostic suggestions with personalized recommendations.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Start Diagnosis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/chat')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <span>Health Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chat with our AI assistant about health concerns, medications, and wellness tips.
              </p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/monitor')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Monitor className="h-5 w-5 text-purple-600" />
                </div>
                <span>Health Monitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your health metrics, vital signs, and wellness progress over time.
              </p>
              <Button variant="outline" className="w-full">
                View Monitor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Health Insights and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span>Health Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{insight.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'active' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.status === 'completed' ? 'text-green-600' :
                        activity.status === 'active' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">12</div>
              <div className="text-sm text-muted-foreground">Consultations Completed</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Health Score</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">24</div>
              <div className="text-sm text-muted-foreground">Health Articles Read</div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
