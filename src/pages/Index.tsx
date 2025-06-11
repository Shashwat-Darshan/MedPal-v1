
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VoiceRecorder from '@/components/VoiceRecorder';
import DiagnosisCard from '@/components/DiagnosisCard';
import QuestionCard from '@/components/QuestionCard';
import { useNavigate } from 'react-router-dom';
import { geminiService, Disease } from '@/services/geminiService';
import { Mic, MessageSquare, Heart, Shield, Menu } from 'lucide-react';

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
    setDiseases([]);
    setCurrentQuestion(null);
    setQuestionCount(0);
    setError(null);
    setUseVoice(false);
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
              <h1 className="text-2xl font-bold text-gray-900">MedPal</h1>
              <span className="text-sm text-blue-600 font-medium">AI Health Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Menu className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Medical Disclaimer */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            ⚠️ This is not professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">How can I help you today?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Describe your symptoms and I'll provide general health information and suggest possible conditions to discuss with your doctor.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Tell me about your symptoms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    variant={useVoice ? "default" : "outline"}
                    onClick={() => setUseVoice(!useVoice)}
                    className="flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Voice Input</span>
                  </Button>
                  <span className="text-sm text-gray-500">or type below</span>
                </div>

                {useVoice ? (
                  <VoiceRecorder onTranscript={handleVoiceInput} />
                ) : (
                  <Textarea
                    placeholder="Describe your symptoms in detail... (e.g., 'I have a runny nose, cough, and feeling tired for 3 days')"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-32"
                  />
                )}

                <Button 
                  onClick={() => setCurrentStep('symptoms')}
                  disabled={!symptoms.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Analyze Symptoms
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Symptoms Analysis Step */}
        {currentStep === 'symptoms' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium text-gray-900 mb-2">You reported:</p>
                  <p className="text-gray-700">{symptoms}</p>
                </div>
                <Button 
                  onClick={handleSymptomSubmit}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Analyzing with AI...' : 'Get AI Analysis'}
                </Button>
                {isLoading && (
                  <div className="mt-4">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2 text-center">Processing your symptoms with Gemini AI...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Diagnosis Step */}
        {currentStep === 'diagnosis' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Possible Conditions</h2>
              <p className="text-gray-600">Based on your symptoms, here are some possibilities:</p>
            </div>

            <div className="grid gap-4">
              {diseases.map((disease, index) => (
                <DiagnosisCard key={index} disease={disease} rank={index + 1} />
              ))}
            </div>

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

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={resetDiagnosis}
              >
                Start Over
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
