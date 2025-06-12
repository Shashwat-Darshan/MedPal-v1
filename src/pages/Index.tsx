import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Clock, Mic, MessageSquare } from 'lucide-react';
import DiagnosisCard from '@/components/DiagnosisCard';
import QuestionCard from '@/components/QuestionCard';
import DiagnosisChat from '@/components/DiagnosisChat';
import { useUserHistory } from '@/hooks/useUserHistory';

interface Disease {
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice';
  options?: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const { addHistoryItem } = useUserHistory();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'symptoms' | 'diagnosis' | 'questions' | 'final'>('welcome');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [useVoice, setUseVoice] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [finalDiagnosis, setFinalDiagnosis] = useState<Disease | null>(null);

  const handleSymptomSubmit = () => {
    if (!symptoms.trim()) return;
    
    // Generate initial 5 diseases with confidence levels
    const initialDiseases: Disease[] = [
      {
        name: 'Common Cold',
        confidence: 75,
        description: 'A viral upper respiratory tract infection',
        symptoms: ['runny nose', 'cough', 'sore throat', 'mild fever']
      },
      {
        name: 'Influenza (Flu)',
        confidence: 70,
        description: 'A viral infection that attacks respiratory system',
        symptoms: ['high fever', 'body aches', 'fatigue', 'headache']
      },
      {
        name: 'Sinusitis',
        confidence: 65,
        description: 'Inflammation of the sinuses',
        symptoms: ['facial pain', 'nasal congestion', 'headache', 'thick nasal discharge']
      },
      {
        name: 'Allergic Rhinitis',
        confidence: 60,
        description: 'Allergic reaction causing nasal symptoms',
        symptoms: ['sneezing', 'runny nose', 'itchy eyes', 'nasal congestion']
      },
      {
        name: 'Migraine',
        confidence: 55,
        description: 'A type of headache disorder',
        symptoms: ['severe headache', 'nausea', 'light sensitivity', 'aura']
      }
    ];

    setDiseases(initialDiseases);
    setCurrentStep('diagnosis');
    generateNextQuestion();
  };

  const generateNextQuestion = () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'Do you have a fever?',
        type: 'yes_no'
      },
      {
        id: '2',
        text: 'How long have you been experiencing these symptoms?',
        type: 'multiple_choice',
        options: ['Less than 24 hours', '1-3 days', '4-7 days', 'More than a week']
      },
      {
        id: '3',
        text: 'Are you experiencing any body aches?',
        type: 'yes_no'
      },
      {
        id: '4',
        text: 'Do you have a runny or stuffy nose?',
        type: 'yes_no'
      },
      {
        id: '5',
        text: 'Is your headache severe and throbbing?',
        type: 'yes_no'
      }
    ];

    if (questionCount < questions.length) {
      setCurrentQuestion(questions[questionCount]);
      setCurrentStep('questions');
    }
  };

  const handleAnswerQuestion = (answer: string) => {
    if (!currentQuestion) return;

    // Adjust confidence levels based on answer
    const updatedDiseases = diseases.map(disease => {
      let confidenceChange = 0;

      // Logic to adjust confidence based on question and answer
      if (currentQuestion.id === '1') { // Fever question
        if (answer === 'yes') {
          if (disease.name === 'Influenza (Flu)') confidenceChange = +15;
          if (disease.name === 'Common Cold') confidenceChange = +5;
          if (disease.name === 'Allergic Rhinitis') confidenceChange = -10;
        } else {
          if (disease.name === 'Allergic Rhinitis') confidenceChange = +10;
          if (disease.name === 'Influenza (Flu)') confidenceChange = -10;
        }
      }

      if (currentQuestion.id === '3') { // Body aches question
        if (answer === 'yes') {
          if (disease.name === 'Influenza (Flu)') confidenceChange = +10;
          if (disease.name === 'Migraine') confidenceChange = +5;
          if (disease.name === 'Allergic Rhinitis') confidenceChange = -5;
        }
      }

      if (currentQuestion.id === '4') { // Runny nose question
        if (answer === 'yes') {
          if (disease.name === 'Common Cold') confidenceChange = +10;
          if (disease.name === 'Allergic Rhinitis') confidenceChange = +15;
          if (disease.name === 'Sinusitis') confidenceChange = +8;
        }
      }

      if (currentQuestion.id === '5') { // Severe headache question
        if (answer === 'yes') {
          if (disease.name === 'Migraine') confidenceChange = +20;
          if (disease.name === 'Sinusitis') confidenceChange = +5;
        }
      }

      return {
        ...disease,
        confidence: Math.min(100, Math.max(0, disease.confidence + confidenceChange))
      };
    });

    // Sort by confidence
    const sortedDiseases = updatedDiseases.sort((a, b) => b.confidence - a.confidence);
    setDiseases(sortedDiseases);

    // Check if we should stop asking questions
    const topDisease = sortedDiseases[0];
    const secondDisease = sortedDiseases[1];
    
    const shouldStop = 
      topDisease.confidence >= 90 || 
      (topDisease.confidence - secondDisease.confidence >= 20 && secondDisease.confidence >= 60);

    if (shouldStop || questionCount >= 4) {
      setFinalDiagnosis(topDisease);
      setCurrentStep('final');
      
      // Add to history
      addHistoryItem({
        symptoms,
        diagnosis: topDisease.name,
        confidence: topDisease.confidence,
        status: 'completed'
      });
    } else {
      setQuestionCount(prev => prev + 1);
      generateNextQuestion();
    }
  };

  const resetDiagnosis = () => {
    setCurrentStep('welcome');
    setSymptoms('');
    setDuration('');
    setSeverity([5]);
    setUseVoice(false);
    setDiseases([]);
    setCurrentQuestion(null);
    setQuestionCount(0);
    setFinalDiagnosis(null);
  };

  const getProgressPercentage = () => {
    if (currentStep === 'welcome') return 0;
    if (currentStep === 'symptoms') return 20;
    if (currentStep === 'diagnosis') return 40;
    if (currentStep === 'questions') return 60 + (questionCount * 8);
    if (currentStep === 'final') return 100;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedPal</h1>
                <span className="text-sm text-blue-600 font-medium">AI Healthcare Assistant</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-blue-600"
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/history')}
                className="text-blue-600"
              >
                History
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  U
                </div>
                <span className="text-sm font-medium">User</span>
              </div>
              <Button variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        {currentStep === 'welcome' && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to MedPal, User</h2>
            <p className="text-lg mb-4">How can I help you today? Please describe your symptoms and I'll help diagnose your condition through targeted questions.</p>
            <Alert className="bg-orange-100 border-orange-300 text-orange-800 mb-0">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Important: This is not professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Progress Tracker */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic Progress</h3>
              <span className="text-sm text-gray-600">{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span className={currentStep === 'symptoms' ? 'text-blue-600 font-medium' : ''}>
                Symptoms
              </span>
              <span className={currentStep === 'diagnosis' ? 'text-blue-600 font-medium' : ''}>
                Analysis
              </span>
              <span className={currentStep === 'questions' ? 'text-blue-600 font-medium' : ''}>
                Questions
              </span>
              <span className={currentStep === 'final' ? 'text-green-600 font-medium' : ''}>
                Results
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms Input */}
        {currentStep === 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Describe Your Symptoms</span>
                  </CardTitle>
                  <p className="text-gray-600">Tell me about what you're experiencing so I can help with an accurate assessment</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What symptoms are you experiencing?
                    </label>
                    <div className="flex items-center space-x-4 mb-4">
                      <Button
                        variant={useVoice ? "default" : "outline"}
                        onClick={() => setUseVoice(!useVoice)}
                        size="sm"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Voice Input
                      </Button>
                      <span className="text-sm text-gray-500">or type below</span>
                    </div>

                    <Textarea
                      placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="few-hours">Few hours</SelectItem>
                          <SelectItem value="1-day">1 day</SelectItem>
                          <SelectItem value="2-3-days">2-3 days</SelectItem>
                          <SelectItem value="1-week">1 week</SelectItem>
                          <SelectItem value="2-weeks">2+ weeks</SelectItem>
                          <SelectItem value="1-month">1+ month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity (1-10): {severity[0]}
                      </label>
                      <div className="px-3">
                        <Slider
                          value={severity}
                          onValueChange={setSeverity}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Mild</span>
                          <span>Moderate</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSymptomSubmit}
                    disabled={!symptoms.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Start Diagnosis
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/history')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                    <span className="ml-auto text-xs text-gray-500">Past consultations</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Emergency Contacts
                    <span className="ml-auto text-xs text-gray-500">Quick access numbers</span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[4, 3, 2].map((num) => (
                    <div key={num} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Consultation #{num}</p>
                        <p className="text-xs text-gray-500">Jun {10 + num}, 2025</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Initial Diagnosis Display */}
        {currentStep === 'diagnosis' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Initial Analysis</CardTitle>
                <p className="text-gray-600">Based on your symptoms, here are the possible conditions. I'll ask some questions to refine the diagnosis.</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 font-medium">Your symptoms: {symptoms}</p>
                </div>
                <div className="grid gap-4">
                  {diseases.map((disease, index) => (
                    <DiagnosisCard key={disease.name} disease={disease} rank={index + 1} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button onClick={generateNextQuestion} className="bg-blue-600 hover:bg-blue-700">
                    Continue with Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question Phase */}
        {currentStep === 'questions' && currentQuestion && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswerQuestion}
                />
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Analysis</CardTitle>
                    <p className="text-sm text-gray-600">Question {questionCount + 1} of 5</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {diseases.slice(0, 3).map((disease, index) => (
                      <div key={disease.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{disease.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {disease.confidence}%
                          </span>
                        </div>
                        <Progress value={disease.confidence} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Final Diagnosis */}
        {currentStep === 'final' && finalDiagnosis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Diagnosis Complete</CardTitle>
                  <p className="text-green-700">Based on your responses, here's my analysis:</p>
                </CardHeader>
                <CardContent>
                  <DiagnosisCard disease={finalDiagnosis} rank={1} />
                  <div className="mt-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-blue-800">
                        Please consult with a healthcare provider for proper diagnosis and treatment. This AI analysis is for informational purposes only.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <DiagnosisChat 
                finalDiagnosis={finalDiagnosis}
                symptoms={symptoms}
                allDiseases={diseases}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Considered Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diseases.map((disease, index) => (
                    <div key={disease.name} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{disease.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {disease.confidence}%
                        </span>
                      </div>
                      <Progress value={disease.confidence} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  onClick={resetDiagnosis}
                  className="w-full"
                >
                  Start New Diagnosis
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
