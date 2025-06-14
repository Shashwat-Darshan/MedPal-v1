
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Stethoscope, Brain, Send, Sparkles, FileText, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DiagnosisCard from '@/components/DiagnosisCard';
import QuestionCard from '@/components/QuestionCard';
import VoiceRecorder from '@/components/VoiceRecorder';
import { analyzeSymptomsWithGemini } from '@/services/geminiService';

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptomsWithGemini(symptoms, age, gender);
      setDiagnosis(result);
      
      // Save to user's history
      if (user?.email) {
        const historyItem = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          symptoms: symptoms,
          diagnosis: result.diagnosis,
          confidence: result.confidence,
          status: 'completed' as const
        };
        
        const storageKey = `medpal_history_${user.email}`;
        const existingHistory = localStorage.getItem(storageKey);
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        history.unshift(historyItem);
        localStorage.setItem(storageKey, JSON.stringify(history));
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setAge('');
    setGender('');
    setDiagnosis(null);
    setShowQuestions(false);
  };

  const handleVoiceResult = (text: string) => {
    setSymptoms(prev => prev + ' ' + text);
  };

  // Mock question data for QuestionCard
  const mockQuestion = {
    id: '1',
    text: 'Have you experienced any fever in the last 24 hours?',
    type: 'yes_no' as const
  };

  const handleQuestionAnswer = (answer: string) => {
    console.log('Answer received:', answer);
    // Handle the answer logic here
  };

  // Mock disease data for DiagnosisCard
  const mockDisease = diagnosis ? {
    name: diagnosis.diagnosis || 'Unknown condition',
    confidence: diagnosis.confidence || 50,
    description: diagnosis.possibleCauses?.[0] || 'No description available',
    symptoms: diagnosis.recommendations || []
  } : null;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Describe Your Symptoms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="glass-light-subtle dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 backdrop-blur-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-gray-700 dark:text-gray-300">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Please describe your symptoms in detail. Include when they started, severity, and any related information..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={6}
                    className="glass-light-subtle dark:bg-gray-800 dark:border-gray-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <VoiceRecorder onTranscript={handleVoiceResult} />
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleReset} className="dark:border-gray-600 dark:text-gray-300">
                      Reset
                    </Button>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || !symptoms.trim()}
                      className="medical-gradient text-white hover:opacity-90"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Analyze Symptoms</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis Results */}
            {diagnosis && mockDisease && (
              <Card className="glass-light dark:glass-card dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <Brain className="h-5 w-5 text-green-600" />
                    <span>AI Diagnosis Results</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {diagnosis.confidence}% Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DiagnosisCard disease={mockDisease} rank={1} />
                </CardContent>
              </Card>
            )}

            {/* Follow-up Questions */}
            {showQuestions && (
              <Card className="glass-light dark:glass-card dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span>Follow-up Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionCard question={mockQuestion} onAnswer={handleQuestionAnswer} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
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
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Multiple Symptoms</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">List all related symptoms you're experiencing</p>
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
