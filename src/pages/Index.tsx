import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Clock, Mic, MessageSquare, HelpCircle, CheckCircle, History, Phone } from 'lucide-react';
import { geminiService, Disease, DiagnosisResponse } from '@/services/geminiService';
import QuestionCard from '@/components/QuestionCard';
import DiagnosisChat from '@/components/DiagnosisChat';
import LoadingSpinner from '@/components/LoadingSpinner';
import VoiceRecorder from '@/components/VoiceRecorder';

const Index = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'symptoms' | 'diagnosis' | 'questions' | 'complete'>('welcome');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [useVoice, setUseVoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Diagnosis state
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [finalDiagnosis, setFinalDiagnosis] = useState<Disease | null>(null);

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    setCurrentStep('diagnosis');
    
    try {
      const response = await geminiService.startDiagnosis(symptoms);
      setDiseases(response.diseases);
      setCurrentQuestion(response.question);
      setQuestionCount(1);
      setCurrentStep('questions');
    } catch (error) {
      console.error('Error starting diagnosis:', error);
      setCurrentStep('symptoms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAnswer = async (answer: string) => {
    setIsLoading(true);
    
    try {
      const response = await geminiService.updateDiagnosis(
        diseases,
        currentQuestion,
        answer,
        questionCount
      );
      
      setDiseases(response.diseases);
      setQuestionCount(prev => prev + 1);
      
      if (response.isComplete || shouldComplete(response.diseases)) {
        setFinalDiagnosis(response.diseases[0]);
        setCurrentStep('complete');
      } else {
        setCurrentQuestion(response.question);
      }
    } catch (error) {
      console.error('Error updating diagnosis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldComplete = (currentDiseases: Disease[]) => {
    if (currentDiseases.length === 0) return false;
    
    const topDisease = currentDiseases[0];
    const secondDisease = currentDiseases[1];
    
    if (topDisease.confidence >= 90) return true;
    
    if (secondDisease && secondDisease.confidence >= 60) {
      const difference = topDisease.confidence - secondDisease.confidence;
      if (difference >= 20) return true;
    }
    
    return false;
  };

  const resetDiagnosis = () => {
    setCurrentStep('welcome');
    setSymptoms('');
    setDuration('');
    setSeverity([5]);
    setUseVoice(false);
    setDiseases([]);
    setCurrentQuestion('');
    setQuestionCount(0);
    setFinalDiagnosis(null);
  };

  const getProgressPercentage = () => {
    if (currentStep === 'welcome') return 0;
    if (currentStep === 'symptoms') return 20;
    if (currentStep === 'diagnosis') return 40;
    if (currentStep === 'questions') return 60 + (questionCount * 5);
    if (currentStep === 'complete') return 100;
    return 0;
  };

  const handleVoiceTranscript = (transcript: string) => {
    setSymptoms(transcript);
    setUseVoice(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome/Symptoms Step */}
        {(currentStep === 'welcome' || currentStep === 'symptoms') && (
          <>
            {/* Diagnostic Progress */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Diagnostic Progress</h2>
                <span className="text-sm text-gray-600">{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="mb-4" />
              
              {/* Progress Steps */}
              <div className="flex justify-between text-sm">
                <div className="flex flex-col items-center text-blue-600">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-blue-600 text-white">
                    1
                  </div>
                  <span>Symptoms</span>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-200">
                    2
                  </div>
                  <span>Questions</span>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-200">
                    3
                  </div>
                  <span>Results</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Symptom Description */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <CardTitle>Describe Your Symptoms</CardTitle>
                    </div>
                    <p className="text-gray-600">Tell me about what you're experiencing so I can help with an accurate assessment</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        What symptoms are you experiencing?
                      </label>
                      
                      {/* Voice Input Toggle */}
                      <div className="flex items-center space-x-4 mb-4">
                        <Button
                          variant={useVoice ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseVoice(!useVoice)}
                          className="flex items-center space-x-2"
                        >
                          <Mic className="h-4 w-4" />
                          <span>Voice Input</span>
                        </Button>
                        <span className="text-sm text-gray-500">or type below</span>
                      </div>

                      {useVoice ? (
                        <VoiceRecorder onTranscript={handleVoiceTranscript} />
                      ) : (
                        <Textarea
                          placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="min-h-32"
                        />
                      )}
                    </div>

                    {/* Duration and Severity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {isLoading ? <LoadingSpinner size="sm" message="Starting Diagnosis..." /> : "Start Diagnosis"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Medical Disclaimer */}
                <Alert className="bg-orange-50 border-orange-200">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Important:</strong> This is not professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate('/history')}
                    >
                      <History className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">View History</div>
                        <div className="text-xs text-gray-500">Past consultations</div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Phone className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Emergency Contacts</div>
                        <div className="text-xs text-gray-500">Quick access numbers</div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Consultation #4</div>
                        <div className="text-xs text-gray-500">Jun 14, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Consultation #3</div>
                        <div className="text-xs text-gray-500">Jun 13, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Consultation #2</div>
                        <div className="text-xs text-gray-500">Jun 12, 2025</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Diagnosis Loading */}
        {currentStep === 'diagnosis' && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" message="Analyzing your symptoms and generating possible conditions..." />
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Diagnostic Assessment</h3>
                  <span className="text-sm text-gray-600">Question {questionCount}</span>
                </div>
                <Progress value={getProgressPercentage()} className="mb-4" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <QuestionCard
                  question={{
                    id: questionCount.toString(),
                    text: currentQuestion,
                    type: 'yes_no'
                  }}
                  onAnswer={handleQuestionAnswer}
                  isLoading={isLoading}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Possible Conditions</CardTitle>
                    <p className="text-sm text-gray-600">Current analysis</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {diseases.map((disease, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{disease.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Math.round(disease.confidence)}%
                          </span>
                        </div>
                        <Progress value={disease.confidence} className="h-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && finalDiagnosis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-green-800 mb-2">
                      Diagnosis Complete
                    </h3>
                    <p className="text-lg text-green-700 mb-4">
                      Most likely condition: <strong>{finalDiagnosis.name}</strong>
                    </p>
                    <p className="text-sm text-green-600 mb-6">
                      Confidence: {Math.round(finalDiagnosis.confidence)}%
                    </p>
                    <p className="text-green-700 mb-6">
                      {finalDiagnosis.description}
                    </p>
                    <Alert className="bg-orange-100 border-orange-300 text-orange-800">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Please consult with a healthcare professional for proper diagnosis and treatment.
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
                    <div key={index} className={`p-3 rounded-lg ${index === 0 ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{disease.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${index === 0 ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {Math.round(disease.confidence)}%
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
