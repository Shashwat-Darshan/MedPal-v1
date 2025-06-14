
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Brain,
  Heart,
  Activity,
  Thermometer,
  Clock,
  User,
  Calendar,
  MapPin,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Plus
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import DiagnosisChat from '@/components/DiagnosisChat';
import QuestionCard from '@/components/QuestionCard';
import DiagnosisCard from '@/components/DiagnosisCard';
import VoiceRecorder from '@/components/VoiceRecorder';
import { geminiService, Disease, DiagnosisResponse } from '@/services/geminiService';

type DiagnosisStep = 'welcome' | 'symptom_input' | 'diagnosis_questions' | 'complete';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [userSymptoms, setUserSymptoms] = useState('');
  const [currentDiseases, setCurrentDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [finalDiagnosis, setFinalDiagnosis] = useState<Disease | null>(null);

  const handleStartDiagnosis = () => {
    setCurrentStep('symptom_input');
  };

  const handleSymptomSubmit = async () => {
    if (!userSymptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Please tell us what symptoms you're experiencing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await geminiService.startDiagnosis(userSymptoms);
      setCurrentDiseases(response.diseases);
      setCurrentQuestion(response.question);
      setQuestionCount(1);
      setCurrentStep('diagnosis_questions');
      
      toast({
        title: "Analysis Started",
        description: "We've identified possible conditions. Please answer the follow-up questions.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to start diagnosis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    setIsLoading(true);
    try {
      const response = await geminiService.updateDiagnosis(
        currentDiseases,
        currentQuestion,
        answer,
        questionCount
      );
      
      setCurrentDiseases(response.diseases);
      setQuestionCount(prev => prev + 1);
      
      if (response.isComplete || response.finalDiagnosis) {
        setFinalDiagnosis(response.finalDiagnosis || response.diseases[0]);
        setCurrentStep('complete');
        
        toast({
          title: "Diagnosis Complete",
          description: `Analysis suggests: ${(response.finalDiagnosis || response.diseases[0]).name}`,
        });
      } else {
        setCurrentQuestion(response.question);
      }
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Unable to process answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'welcome': return 0;
      case 'symptom_input': return 25;
      case 'diagnosis_questions': return 50 + (questionCount * 5);
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Health Diagnosis
            </h1>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
              {currentStep === 'welcome' ? 'Getting Started' : 
               currentStep === 'symptom_input' ? 'Describing Symptoms' :
               currentStep === 'diagnosis_questions' ? `Question ${questionCount}` : 'Complete'}
            </Badge>
          </div>
          <Progress value={getStepProgress()} className="h-2 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card className="glass-card border-0 dark:bg-gray-800/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">How can I help you today?</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-lg">I'm your AI health assistant. Tell me about your symptoms and I'll help you understand what might be going on.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Smart Analysis</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">I'll analyze your symptoms and suggest possible conditions</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Step by Step</h3>
                  <p className="text-sm text-green-700 dark:text-green-200">I'll ask questions to narrow down the possibilities</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Quick Results</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-200">Get insights and recommendations in minutes</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Important Disclaimer</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      This AI tool provides general health information only. Always consult with qualified healthcare providers for serious health concerns or medical emergencies.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartDiagnosis}
                className="w-full medical-gradient text-white hover:opacity-90 py-3 text-lg"
              >
                Start Describing Your Symptoms
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Symptom Input Step */}
        {currentStep === 'symptom_input' && (
          <Card className="glass-card border-0 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <span>Tell me about your symptoms</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Describe what you're experiencing in your own words. Be as specific as possible.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={userSymptoms}
                onChange={(e) => setUserSymptoms(e.target.value)}
                placeholder="For example: I have a headache that started this morning, feel nauseous, and have a slight fever..."
                className="min-h-[120px] text-base"
                disabled={isLoading}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSymptomSubmit}
                  disabled={!userSymptoms.trim() || isLoading}
                  className="medical-gradient text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Step */}
        {currentStep === 'diagnosis_questions' && (
          <div className="space-y-6">
            {/* Current Diseases */}
            <Card className="glass-card border-0 dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Possible Conditions</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">Based on your symptoms, here are the most likely conditions:</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentDiseases.slice(0, 3).map((disease, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{disease.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{disease.description}</p>
                      </div>
                      <Badge variant="outline" className={
                        disease.confidence >= 70 ? 'bg-green-50 text-green-700 border-green-200' :
                        disease.confidence >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }>
                        {disease.confidence}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <QuestionCard
              question={{
                id: `q${questionCount}`,
                text: currentQuestion,
                type: 'multiple_choice',
                options: ['Yes', 'No', 'Not sure']
              }}
              onAnswer={handleAnswerSubmit}
              isLoading={isLoading}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('symptom_input')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Symptoms
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question {questionCount} • {currentDiseases[0]?.confidence}% confidence
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'complete' && finalDiagnosis && (
          <div className="space-y-6">
            <DiagnosisCard 
              disease={finalDiagnosis}
              rank={1}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('symptom_input')} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Button onClick={() => navigate('/chat')} className="flex-1 medical-gradient text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Discuss with AI Doctor
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
