
import React from 'react';
import { Stethoscope, Brain, Sparkles, CheckCircle, AlertCircle, History, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import DiagnosticFlow from '@/components/DiagnosticFlow';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Medical Diagnosis
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Get instant health assessment powered by advanced AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Assistant Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>Advanced Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Diagnostic Flow */}
          <div className="lg:col-span-3">
            <DiagnosticFlow />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <History className="h-4 w-4 mr-2 text-blue-500" />
                  View History
                  <span className="ml-auto text-xs text-gray-500">Past consultations</span>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                  Emergency Contacts
                  <span className="ml-auto text-xs text-gray-500">Quick access numbers</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100 text-base">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Consultation #4</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jun 14, 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Consultation #3</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jun 13, 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Consultation #2</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jun 12, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span>Tips for Better Diagnosis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 tip-card rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Be Detailed</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Describe symptoms with timeline and severity</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 tip-card rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Include Context</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mention recent activities or exposures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 tip-card rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Answer Honestly</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Provide accurate responses to questions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="glass-light dark:glass-card dark:border-gray-700 border-orange-200 dark:border-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300 text-base">
                  <AlertCircle className="h-5 w-5" />
                  <span>Important Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  This AI diagnosis is for informational purposes only and should not replace professional medical advice. 
                  Always consult with a healthcare provider for accurate diagnosis and treatment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
