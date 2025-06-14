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

type DiagnosisStep = 'welcome' | 'symptoms' | 'questions' | 'complete';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SymptomData {
  primary: string;
  duration: string;
  severity: Severity;
  additional: string[];
  triggers: string[];
  medications: string[];
  medicalHistory: string[];
}

interface DiagnosisResult {
  condition: string;
  confidence: number;
  severity: Severity;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  followUp: string;
}

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  const [symptomData, setSymptomData] = useState<SymptomData>({
    primary: '',
    duration: '',
    severity: 'low',
    additional: [],
    triggers: [],
    medications: [],
    medicalHistory: []
  });

  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Joint Pain',
    'Skin Rash', 'Sore Throat', 'Back Pain', 'Muscle Aches'
  ];

  const followUpQuestions = [
    {
      id: 'onset',
      question: 'When did these symptoms first appear?',
      type: 'radio' as const,
      options: ['Less than 24 hours', '1-3 days ago', '4-7 days ago', 'More than a week ago']
    },
    {
      id: 'progression',
      question: 'How have your symptoms changed over time?',
      type: 'radio' as const,
      options: ['Getting worse', 'Staying the same', 'Getting better', 'Coming and going']
    },
    {
      id: 'triggers',
      question: 'What makes your symptoms worse?',
      type: 'text' as const,
      placeholder: 'Describe any triggers or activities that worsen symptoms...'
    }
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('symptoms');
    } else if (currentStep === 'symptoms') {
      if (selectedSymptoms.length === 0) {
        toast({
          title: "Please select symptoms",
          description: "Please select at least one symptom to continue.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep('questions');
    } else if (currentStep === 'questions') {
      if (currentQuestionIndex < followUpQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        generateDiagnosis();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'symptoms') {
      setCurrentStep('welcome');
    } else if (currentStep === 'questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else {
        setCurrentStep('symptoms');
      }
    } else if (currentStep === 'complete') {
      setCurrentStep('questions');
      setCurrentQuestionIndex(followUpQuestions.length - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const generateDiagnosis = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: DiagnosisResult = {
        condition: selectedSymptoms.includes('Fever') && selectedSymptoms.includes('Cough') 
          ? 'Common Cold' 
          : selectedSymptoms.includes('Headache') 
          ? 'Tension Headache'
          : 'General Malaise',
        confidence: Math.floor(Math.random() * 20) + 80,
        severity: selectedSymptoms.length > 3 ? 'medium' : 'low',
        description: 'Based on your symptoms, this appears to be a common condition that typically resolves with proper care.',
        recommendations: [
          'Get adequate rest and sleep',
          'Stay hydrated by drinking plenty of fluids',
          'Consider over-the-counter pain relief if needed',
          'Monitor symptoms and seek medical attention if they worsen'
        ],
        urgency: selectedSymptoms.length > 4 ? 'medium' : 'low',
        followUp: 'If symptoms persist for more than 7 days or worsen, please consult with a healthcare professional.'
      };
      
      setDiagnosisResult(mockResult);
      setCurrentStep('complete');
      
      toast({
        title: "Diagnosis Complete",
        description: `Analysis suggests: ${mockResult.condition} (${mockResult.confidence}% confidence)`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate diagnosis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'welcome': return 0;
      case 'symptoms': return 25;
      case 'questions': return 50 + (currentQuestionIndex / followUpQuestions.length) * 25;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Health Diagnosis
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Step {currentStep === 'welcome' ? 1 : currentStep === 'symptoms' ? 2 : currentStep === 'questions' ? 3 : 4} of 4
            </Badge>
          </div>
          <Progress value={getStepProgress()} className="h-2 bg-gray-200" />
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card className="glass-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">AI-Powered Health Analysis</CardTitle>
              <p className="text-gray-600 text-lg">Get instant, intelligent health insights powered by advanced AI</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 mb-2">Smart Analysis</h3>
                  <p className="text-sm text-blue-700">Advanced AI analyzes your symptoms with medical precision</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 mb-2">Privacy First</h3>
                  <p className="text-sm text-green-700">Your health data is secure and confidential</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900 mb-2">Instant Results</h3>
                  <p className="text-sm text-purple-700">Get comprehensive health insights in seconds</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">Important Disclaimer</h4>
                    <p className="text-sm text-amber-800">
                      This AI diagnosis tool is for informational purposes only and should not replace professional medical advice. 
                      Always consult with qualified healthcare providers for serious health concerns.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleNext}
                className="w-full medical-gradient text-white hover:opacity-90 py-3 text-lg"
              >
                Start Health Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Symptoms Selection Step */}
        {currentStep === 'symptoms' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <span>Select Your Symptoms</span>
              </CardTitle>
              <p className="text-gray-600">Choose all symptoms you're currently experiencing</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonSymptoms.map((symptom) => (
                  <div
                    key={symptom}
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      selectedSymptoms.includes(symptom)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedSymptoms.includes(symptom)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSymptoms.includes(symptom) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{symptom}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Symptoms ({selectedSymptoms.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary" className="bg-blue-100 text-blue-800">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={selectedSymptoms.length === 0}
                  className="medical-gradient text-white"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <span>Additional Questions</span>
              </CardTitle>
              <p className="text-gray-600">Help us provide a more accurate analysis</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionCard
                question={followUpQuestions[currentQuestionIndex]}
                answer={answers[followUpQuestions[currentQuestionIndex].id] || ''}
                onAnswerChange={(answer) => handleAnswerChange(followUpQuestions[currentQuestionIndex].id, answer)}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {currentQuestionIndex === 0 ? 'Back to Symptoms' : 'Previous'}
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!answers[followUpQuestions[currentQuestionIndex].id]}
                  className="medical-gradient text-white"
                >
                  {currentQuestionIndex === followUpQuestions.length - 1 ? (
                    isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Complete Analysis'
                    )
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Step */}
        {currentStep === 'complete' && diagnosisResult && (
          <div className="space-y-6">
            <DiagnosisCard diagnosis={diagnosisResult} />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Modify Answers
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
