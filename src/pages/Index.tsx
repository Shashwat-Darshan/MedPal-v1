
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import VoiceRecorder from '@/components/VoiceRecorder';
import DiagnosisCard from '@/components/DiagnosisCard';
import QuestionCard from '@/components/QuestionCard';
import { useNavigate } from 'react-router-dom';
import { geminiService, Disease } from '@/services/geminiService';
import { Mic, MessageSquare, Heart, Shield, Menu, Clock, Activity } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice';
  options?: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'symptoms' | 'diagnosis' | 'questions'>('welcome');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await geminiService.startDiagnosis(symptoms);
      setDiseases(response.diseases);
      setCurrentQuestion({
        id: '1',
        text: response.question,
        type: 'yes_no'
      });
      setQuestionCount(1);
      setCurrentStep('diagnosis');
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError('Unable to process your symptoms right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await geminiService.updateDiagnosis(
        diseases,
        currentQuestion.text,
        answer,
        questionCount
      );
      
      setDiseases(response.diseases);
      setQuestionCount(prev => prev + 1);
      
      if (response.isComplete || questionCount >= 10) {
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion({
          id: (questionCount + 1).toString(),
          text: response.question,
          type: 'yes_no'
        });
      }
    } catch (err) {
      console.error('Question answer error:', err);
      setError('Unable to process your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setSymptoms(transcript);
  };

  const resetDiagnosis = () => {
    setCurrentStep('welcome');
    setSymptoms('');
    setDuration('');
    setSeverity([5]);
    setDiseases([]);
    setCurrentQuestion(null);
    setQuestionCount(0);
    setError(null);
    setUseVoice(false);
  };

  const getProgressPercentage = () => {
    if (currentStep === 'welcome') return 0;
    if (currentStep === 'symptoms') return 25;
    if (currentStep === 'diagnosis' && questionCount === 0) return 50;
    if (currentStep === 'diagnosis' && questionCount > 0) return 50 + (questionCount * 5);
    return 100;
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
                  S
                </div>
                <span className="text-sm font-medium">shashwat153790</span>
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
            <p className="text-lg mb-4">I'll help diagnose your condition by asking targeted questions and analyzing your responses with AI.</p>
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
              <span className={currentStep === 'symptoms' || currentStep === 'diagnosis' ? 'text-blue-600 font-medium' : ''}>
                Symptoms
              </span>
              <span className={currentStep === 'diagnosis' ? 'text-blue-600 font-medium' : ''}>
                Questions
              </span>
              <span className={!currentQuestion && diseases.length > 0 ? 'text-green-600 font-medium' : ''}>
                Results
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

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

                    {useVoice ? (
                      <VoiceRecorder onTranscript={handleVoiceInput} />
                    ) : (
                      <Textarea
                        placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="min-h-24"
                      />
                    )}
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
                    disabled={!symptoms.trim() || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isLoading ? 'Analyzing...' : 'Start Diagnosis'}
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

        {/* Diagnosis Results */}
        {currentStep === 'diagnosis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{symptoms}</p>
                    {duration && <p className="text-sm text-gray-500 mt-2">Duration: {duration.replace('-', ' ')}</p>}
                    {severity[0] > 1 && <p className="text-sm text-gray-500">Severity: {severity[0]}/10</p>}
                  </div>
                </CardContent>
              </Card>

              {currentQuestion && (
                <QuestionCard 
                  question={currentQuestion} 
                  onAnswer={handleQuestionAnswer} 
                />
              )}

              {!currentQuestion && diseases.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Analysis Complete
                      </h3>
                      <p className="text-green-700">
                        Based on your responses, we recommend discussing <strong>{diseases[0].name}</strong> with your healthcare provider.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Possible Conditions</CardTitle>
                  <p className="text-sm text-gray-600">Based on current analysis</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diseases.slice(0, 5).map((disease, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
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
                  Start Over
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
