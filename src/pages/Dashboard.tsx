
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Heart, 
  Activity, 
  MessageSquare, 
  History, 
  Monitor, 
  Stethoscope,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Shield
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const healthMetrics = [
    { label: 'Heart Rate', value: '72 BPM', status: 'normal', color: 'text-green-600' },
    { label: 'Blood Pressure', value: '120/80', status: 'optimal', color: 'text-green-600' },
    { label: 'Temperature', value: '98.6°F', status: 'normal', color: 'text-green-600' },
    { label: 'Weight', value: '165 lbs', status: 'stable', color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your AI-powered healthcare assistant is ready to help you with symptom analysis and health monitoring.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>All systems operational</span>
              </div>
              <div className="flex items-center space-x-1 text-primary">
                <Shield className="h-4 w-4" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {healthMetrics.map((metric, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className={`text-xs font-medium ${metric.color}`}>{metric.status}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card" onClick={() => navigate('/diagnosis')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <span>AI Diagnosis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Describe your symptoms and get AI-powered diagnostic suggestions with 95% accuracy.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <Brain className="h-4 w-4" />
                <span>Advanced AI Analysis</span>
              </div>
              <Button className="w-full">
                Start Diagnosis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card" onClick={() => navigate('/chat')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <span>Health Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chat with our AI assistant about health concerns and get instant answers.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Available 24/7</span>
              </div>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card" onClick={() => navigate('/monitor')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Monitor className="h-5 w-5 text-purple-600" />
                </div>
                <span>Health Monitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your health metrics and vital signs with real-time monitoring.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <TrendingUp className="h-4 w-4" />
                <span>Trend Analysis</span>
              </div>
              <Button variant="outline" className="w-full">
                View Monitor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Completed health consultation</p>
                    <p className="text-xs text-muted-foreground">2 hours ago • Respiratory symptoms</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Updated health profile</p>
                    <p className="text-xs text-muted-foreground">1 day ago • Added allergies</p>
                  </div>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Scheduled check-up reminder</p>
                    <p className="text-xs text-muted-foreground">3 days ago • Annual physical</p>
                  </div>
                  <Calendar className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
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

          {/* Health Insights */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Health Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Great Progress!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Your cardiovascular health has improved by 15% this month.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Recommendation</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Consider increasing daily water intake to 8 glasses.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">Community Insight</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">85% of users with similar profiles report better sleep.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">Health Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Goals Met</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
