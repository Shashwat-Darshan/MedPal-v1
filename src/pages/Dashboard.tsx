import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Calendar, Clock, TrendingUp, Users, MessageSquare, Stethoscope, AlertTriangle, CheckCircle, Plus, ArrowRight, Sparkles, Brain, Shield, Zap, Star } from 'lucide-react';
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
    {
      name: 'Early Bird',
      description: 'Completed morning checkup',
      icon: '🌅'
    },
    {
      name: 'Consistency King',
      description: '7 day health tracking streak',
      icon: '👑'
    },
    {
      name: 'Health Detective',
      description: 'Used AI diagnosis 5 times',
      icon: '🔍'
    }
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
      
      <main className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 lg:px-6">
        {/* Enhanced Welcome Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3 min-w-0 flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                    {greeting}!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">Here's your personalized health dashboard</p>
                </div>
              </div>
              
              {/* Live Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="whitespace-nowrap">Live: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="whitespace-nowrap">{userStats.streakDays} day streak</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Star className="h-4 w-4 text-purple-500" />
                  <span className="whitespace-nowrap">{userStats.achievementsUnlocked} achievements</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Button variant="outline" size="default" className="flex items-center space-x-2 glass-light dark:glass-card dark:border-gray-700 dark:text-gray-200 text-sm">
                <Brain className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">AI Health Insights</span>
              </Button>
              <Button onClick={() => navigate('/diagnosis')} size="default" className="medical-gradient text-white hover:opacity-90 flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">New Diagnosis</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main Content - appears first on mobile */}
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="stat-card floating-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-blue-100 text-xs truncate">Total Consultations</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{userStats.totalConsultations}</p>
                      <p className="text-blue-200 text-xs truncate">+2 this week</p>
                    </div>
                    <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white floating-card glass-stats">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-green-100 text-xs truncate">Health Score</p>
                      <p className="text-xl sm:text-2xl font-bold">{userStats.healthScore}</p>
                      <p className="text-green-200 text-xs truncate">Excellent</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-200" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <Progress value={userStats.healthScore} className="mt-2 bg-green-400/30" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white floating-card glass-stats">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-purple-100 text-xs truncate">Streak Days</p>
                      <p className="text-xl sm:text-2xl font-bold">{userStats.streakDays}</p>
                      <p className="text-purple-200 text-xs truncate">Keep it up!</p>
                    </div>
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white floating-card glass-stats">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-orange-100 text-xs truncate">Achievements</p>
                      <p className="text-xl sm:text-2xl font-bold">{userStats.achievementsUnlocked}</p>
                      <p className="text-orange-200 text-xs truncate">2 more to unlock</p>
                    </div>
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div key={index} onClick={action.action} className="feature-card cursor-pointer group p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3 min-w-0 flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white flex-shrink-0`}>
                              <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{action.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{action.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300 w-fit">
                            {action.feature}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                  <span>Recent Activity</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="dark:text-gray-300 dark:hover:text-white text-xs sm:text-sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-card flex items-start space-x-4 p-3 sm:p-4 rounded-xl">
                      <div className="flex-shrink-0">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words flex-1">{activity.title}</h4>
                          <Badge variant={activity.status === 'success' ? 'default' : 'secondary'} className="dark:bg-gray-700 dark:text-gray-300 text-xs flex-shrink-0">
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">{activity.description}</p>
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500 break-words">{activity.time}</p>
                          {activity.confidence && (
                            <span className="text-xs text-blue-600 font-medium flex-shrink-0">
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

          {/* Left Sidebar - appears second on mobile */}
          <div className="lg:col-span-3 lg:order-1 space-y-4">
            {/* AI Health Insights */}
            <HealthInsights />

            {/* Health Tips */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Health Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-4 tip-card rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">💧</span>
                    </div>
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 break-words">Stay Hydrated</h4>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 break-words">Drink water regularly throughout the day.</p>
                </div>
                <div className="p-4 tip-card rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🚶</span>
                    </div>
                    <h4 className="font-medium text-sm text-green-900 dark:text-green-100 break-words">Get Moving</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 break-words">Take short walks during breaks.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 lg:order-3 space-y-4">
            {/* Achievements Section */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 tip-card rounded-lg">
                    <span className="text-2xl flex-shrink-0">{achievement.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 break-words">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-words">{achievement.description}</p>
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
