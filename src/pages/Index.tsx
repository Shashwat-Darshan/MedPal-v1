import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Clock, Mic, MessageSquare, HelpCircle, CheckCircle, History, Phone, RotateCcw, Brain, Sparkles, Zap, Target, Plus } from 'lucide-react';
import { geminiService, Disease, DiagnosisResponse } from '@/services/geminiService';
import QuestionCard from '@/components/QuestionCard';
import DiagnosisChat from '@/components/DiagnosisChat';
import LoadingSpinner from '@/components/LoadingSpinner';
import VoiceRecorder from '@/components/VoiceRecorder';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Enhanced health tips with more variety
  const healthTips = [
    "💧 Drink at least 8 glasses of water daily to stay hydrated and boost your immune system!",
    "🚶‍♂️ Take a 10-minute walk after meals to aid digestion and improve circulation.",
    "😴 Aim for 7-9 hours of quality sleep each night for optimal health recovery.",
    "🥗 Include colorful fruits and vegetables in your daily diet for essential nutrients.",
    "🧘‍♀️ Practice deep breathing for 5 minutes daily to reduce stress and anxiety.",
    "🌞 Get 15 minutes of sunlight exposure for natural Vitamin D synthesis.",
    "🏃‍♂️ Regular exercise for 30 minutes can boost both physical and mental health.",
    "📱 Take breaks from screens every 20 minutes to rest your eyes and prevent strain.",
    "🍯 Replace processed sugars with natural alternatives like honey or fruits.",
    "🧼 Wash your hands frequently to prevent the spread of germs and infections."
  ];

  const [currentTip] = useState(() => 
    healthTips[Math.floor(Math.random() * healthTips.length)]
  );

  const saveToHistory = (diagnosis: Disease) => {
    if (!user?.email) return;
    
    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      symptoms,
      diagnosis: diagnosis.name,
      confidence: diagnosis.confidence,
      status: 'completed' as const
    };

    const storageKey = `medpal_history_${user.email}`;
    const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedHistory = [historyItem, ...existingHistory];
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

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
        const topDisease = response.diseases[0];
        setFinalDiagnosis(topDisease);
        saveToHistory(topDisease);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Health Tip Banner */}
        <Alert className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <AlertDescription className="text-green-800 font-medium">
              <strong>💡 Daily Health Tip:</strong> {currentTip}
            </AlertDescription>
          </div>
        </Alert>

        {/* Welcome/Symptoms Step */}
        {(currentStep === 'welcome' || currentStep === 'symptoms') && (
          <>
            {/* Enhanced Diagnostic Progress */}
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">AI Diagnostic Journey</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Smart Analysis</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{Math.round(getProgressPercentage())}%</span>
                </div>
              </div>
              <Progress value={getProgressPercentage()} className="mb-6 h-3" />
              
              {/* Enhanced Progress Steps */}
              <div className="flex justify-between">
                <div className="flex flex-col items-center group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    currentStep === 'welcome' || currentStep === 'symptoms' 
                      ? 'medical-gradient text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Symptoms</span>
                  <span className="text-xs text-gray-500">Describe your condition</span>
                </div>
                <div className="flex flex-col items-center group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    currentStep === 'questions' 
                      ? 'medical-gradient text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Questions</span>
                  <span className="text-xs text-gray-500">AI clarification</span>
                </div>
                <div className="flex flex-col items-center group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    currentStep === 'complete' 
                      ? 'medical-gradient text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Results</span>
                  <span className="text-xs text-gray-500">AI diagnosis</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Enhanced Symptom Description */}
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Describe Your Symptoms</CardTitle>
                        <p className="text-gray-600 text-sm">Our AI will analyze your symptoms for accurate assessment</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        What symptoms are you experiencing?
                      </label>
                      
                      {/* Enhanced Voice Input Toggle */}
                      <div className="flex items-center space-x-4 mb-4">
                        <Button
                          variant={useVoice ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseVoice(!useVoice)}
                          className={`flex items-center space-x-2 ${useVoice ? 'medical-gradient text-white' : ''}`}
                        >
                          <Mic className="h-4 w-4" />
                          <span>Voice Input</span>
                        </Button>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>or type below</span>
                        </div>
                      </div>

                      {useVoice ? (
                        <VoiceRecorder onTranscript={handleVoiceTranscript} />
                      ) : (
                        <Textarea
                          placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever. The headache is mainly on the right side and gets worse with movement..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="min-h-40 resize-none border-2 focus:border-blue-400 transition-colors"
                        />
                      )}
                    </div>

                    {/* Enhanced Duration and Severity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="border-2 focus:border-blue-400">
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

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Severity Level: {severity[0]}/10
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
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>😊 Mild</span>
                            <span>😐 Moderate</span>
                            <span>😣 Severe</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSymptomSubmit}
                      disabled={!symptoms.trim() || isLoading}
                      className="w-full medical-gradient text-white hover:opacity-90 py-6 text-lg font-medium"
                      size="lg"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" message="AI analyzing symptoms..." />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Brain className="h-5 w-5" />
                          <span>Start AI Diagnosis</span>
                          <Sparkles className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Enhanced Medical Disclaimer */}
                <Alert className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Important Medical Disclaimer:</strong> This AI-powered diagnostic tool is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-blue-50"
                      onClick={() => navigate('/history')}
                    >
                      <History className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">View History</div>
                        <div className="text-xs text-gray-500">Past consultations & trends</div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-green-50"
                      onClick={() => navigate('/chat')}
                    >
                      <MessageSquare className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Health Chat</div>
                        <div className="text-xs text-gray-500">Ask health questions</div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50"
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
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 4, date: 'Jun 14, 2025', result: 'Common Cold', confidence: '94%' },
                      { id: 3, date: 'Jun 13, 2025', result: 'Tension Headache', confidence: '87%' },
                      { id: 2, date: 'Jun 12, 2025', result: 'Allergic Reaction', confidence: '92%' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.result}</div>
                          <div className="text-xs text-gray-500">{item.date}</div>
                        </div>
                        <div className="text-xs text-blue-600 font-medium">{item.confidence}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Diagnosis Loading */}
        {currentStep === 'diagnosis' && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <LoadingSpinner size="lg" message="AI is analyzing your symptoms and cross-referencing with medical databases..." />
            </div>
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <>
            <Card className="glass-card mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Diagnostic Assessment</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Question {questionCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetDiagnosis}
                      className="flex items-center space-x-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Restart Checkup</span>
                    </Button>
                  </div>
                </div>
                <Progress value={getProgressPercentage()} className="mb-4 h-3" />
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
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span>Possible Conditions</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">Current AI analysis</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {diseases.map((disease, index) => (
                      <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-sm">{disease.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            index === 0 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {Math.round(disease.confidence)}%
                          </span>
                        </div>
                        <Progress value={disease.confidence} className="h-2" />
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
              <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-green-800 mb-3">
                      Diagnosis Complete
                    </h3>
                    <p className="text-xl text-green-700 mb-4">
                      Most likely condition: <strong>{finalDiagnosis.name}</strong>
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          AI Confidence: {Math.round(finalDiagnosis.confidence)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-green-700 mb-8 text-lg">
                      {finalDiagnosis.description}
                    </p>
                    <Alert className="bg-orange-100 border-orange-300 text-orange-800">
                      <Shield className="h-5 w-5" />
                      <AlertDescription className="font-medium">
                        Please consult with a healthcare professional for proper diagnosis and treatment plan.
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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>All Considered Conditions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diseases.map((disease, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-sm">{disease.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          index === 0 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {Math.round(disease.confidence)}%
                        </span>
                      </div>
                      <Progress value={disease.confidence} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  onClick={resetDiagnosis}
                  className="w-full hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Diagnosis
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full medical-gradient text-white hover:opacity-90"
                >
                  <Heart className="h-4 w-4 mr-2" />
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
