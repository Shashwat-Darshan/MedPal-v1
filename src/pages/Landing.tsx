import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Brain, Shield, Clock, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 scroll-smooth">{/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MedPal
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="hover:scale-105 transition-transform duration-200 hover:shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-scale-in">
            AI-Powered Health
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assistant
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto opacity-0 animate-fade-in [animation-delay:200ms] [animation-fill-mode:forwards]">
            Get instant health assessments, symptom analysis, and personalized medical insights 
            powered by advanced AI technology. Your health companion is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in [animation-delay:400ms] [animation-fill-mode:forwards]">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-all duration-300 hover:shadow-xl">
                Start Free Diagnosis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-all duration-300 hover:shadow-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white/50 dark:bg-gray-900/50 opacity-0 animate-fade-in [animation-delay:600ms] [animation-fill-mode:forwards]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-scale-in">
              Why Choose MedPal?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Advanced AI technology meets healthcare to provide you with accurate insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:800ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered Analysis</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced machine learning algorithms analyze symptoms to provide accurate health insights
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:900ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Instant Results</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Get immediate health assessments without waiting for appointments or long queues
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:1000ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Privacy First</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Your health data is encrypted and secure. We prioritize your privacy above everything
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:1100ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">24/7 Availability</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Access health guidance anytime, anywhere. Your AI health assistant never sleeps
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:1200ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Medical Grade</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Built with medical professionals to ensure accuracy and reliability in health assessments
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in [animation-delay:1300ms] [animation-fill-mode:forwards]">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Personalized Care</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Tailored health recommendations based on your medical history and symptoms
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 opacity-0 animate-fade-in [animation-delay:1400ms] [animation-fill-mode:forwards]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-scale-in">
            Ready to Take Control of Your Health?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who trust MedPal for their health insights
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-3 hover:scale-110 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
              Start Your Free Assessment
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 MedPal. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;