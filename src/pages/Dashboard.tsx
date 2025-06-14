
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Brain,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import HealthGoals from '@/components/HealthGoals';
import HealthInsights from '@/components/HealthInsights';
import EmergencyContacts from '@/components/EmergencyContacts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    return () => clearInterval(timer);
  }, []);

  // Enhanced user data with more engagement features
  const userStats = {
    totalConsultations: 12,
    lastCheckup: '2 days ago',
    upcomingAppointments: 1,
    healthScore: 85,
    streakDays: 7,
    achievementsUnlocked: 3
  };

  const recentActivity = [
    {
      id: 1,
      type: 'consultation',
      title: 'AI Diagnosis Completed',
      description: 'Common Cold diagnosed with 92% confidence',
      time: '2 hours ago',
      status: 'completed',
      confidence: 92
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Health Streak Achievement!',
      description: '7 days of consistent health tracking',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'goal',
      title: 'Daily Steps Goal Achieved',
      description: '10,000 steps completed with bonus 2,000',
      time: '5 hours ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Medication Reminder',
      description: 'Time to take your evening medication',
      time: '1 day ago',
      status: 'pending'
    }
  ];

  const quickActions = [
    {
      title: 'AI Diagnosis',
      description: 'Get instant health assessment',
      icon: Stethoscope,
      action: () => navigate('/diagnosis'),
      gradient: 'from-blue-500 to-blue-600',
      feature: 'Smart AI'
    },
    {
      title: 'Health Chat',
      description: 'Ask health questions',
      icon: MessageSquare,
      action: () => navigate('/chat'),
      gradient: 'from-green-500 to-emerald-600',
      feature: '24/7 Support'
    },
    {
      title: 'Monitor Vitals',
      description: 'Track your health metrics',
      icon: Activity,
      action: () => navigate('/monitor'),
      gradient: 'from-purple-500 to-purple-600',
      feature: 'Real-time'
    },
    {
      title: 'View History',
      description: 'See past consultations',
      icon: Clock,
      action: () => navigate('/history'),
      gradient: 'from-orange-500 to-red-500',
      feature: 'Analytics'
    }
  ];

  const achievements = [
    { name: 'Early Bird', description: 'Completed morning checkup', icon: '🌅' },
    { name: 'Consistency King', description: '7 day health tracking streak', icon: '👑' },
    { name: 'Health Detective', description: 'Used AI diagnosis 5 times', icon: '🔍' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {greeting}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">Here's your personalized health dashboard</p>
                </div>
              </div>
              
              {/* Live Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>{userStats.streakDays} day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-500" />
                  <span>{userStats.achievementsUnlocked} achievements</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex items-center space-x-2 glass-light dark:glass-card dark:border-gray-700 dark:text-gray-200">
                <Brain className="h-4 w-4" />
                <span>AI Health Insights</span>
              </Button>
              <Button onClick={() => navigate('/diagnosis')} className="medical-gradient text-white hover:opacity-90 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Diagnosis</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Health Tips and AI Insights */}
          <div className="space-y-6">
            {/* AI Health Insights */}
            <HealthInsights />

            {/* Health Tips */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Today's Health Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 tip-card rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💧</span>
                    </div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Stay Hydrated</h4>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Drink water regularly throughout the day to maintain optimal health.</p>
                </div>
                <div className="p-4 tip-card rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🚶</span>
                    </div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Get Moving</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">Take short walks during breaks to improve circulation and energy.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="stat-card floating-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Consultations</p>
                      <p className="text-3xl font-bold text-white">{userStats.totalConsultations}</p>
                      <p className="text-blue-200 text-xs">+2 this week</p>
                    </div>
                    <Stethoscope className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Health Score</p>
                      <p className="text-3xl font-bold">{userStats.healthScore}</p>
                      <p className="text-green-200 text-xs">Excellent</p>
                    </div>
                    <div className="relative">
                      <Heart className="h-8 w-8 text-green-200" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <Progress value={userStats.healthScore} className="mt-3 bg-green-400/30" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Streak Days</p>
                      <p className="text-3xl font-bold">{userStats.streakDays}</p>
                      <p className="text-purple-200 text-xs">Keep it up!</p>
                    </div>
                    <Zap className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Achievements</p>
                      <p className="text-3xl font-bold">{userStats.achievementsUnlocked}</p>
                      <p className="text-orange-200 text-xs">2 more to unlock</p>
                    </div>
                    <Star className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions with Enhanced Design */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={action.action}
                      className="feature-card cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white`}>
                              <action.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{action.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                            {action.feature}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity with Enhanced UI */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <span>Recent Activity</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="dark:text-gray-300 dark:hover:text-white">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-card flex items-start space-x-4 p-4 rounded-xl">
                      <div className="flex-shrink-0">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</h4>
                          <Badge variant={activity.status === 'success' ? 'default' : 'secondary'} className="dark:bg-gray-700 dark:text-gray-300">
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</p>
                          {activity.confidence && (
                            <span className="text-xs text-blue-600 font-medium">
                              {activity.confidence}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Goals */}
            <HealthGoals />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:hidden">
            {/* Achievements Section */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 tip-card rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <EmergencyContacts />
          </div>
        </div>

        {/* Bottom Section for larger screens */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mt-8">
          <div></div>
          <div></div>
          <div className="space-y-6">
            {/* Achievements Section */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 tip-card rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <EmergencyContacts />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
