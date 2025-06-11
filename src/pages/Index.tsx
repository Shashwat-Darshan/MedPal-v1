
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VoiceRecorder from '@/components/VoiceRecorder';
import DiagnosisCard from '@/components/DiagnosisCard';
import QuestionCard from '@/components/QuestionCard';
import { Mic, MessageSquare, Heart, Shield } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState<'welcome' | 'symptoms' | 'diagnosis' | 'questions'>('welcome');
  const [symptoms, setSymptoms] = useState('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);

  // Mock data for demonstration
  const mockDiseases: Disease[] = [
    {
      name: "Common Cold",
      confidence: 75,
      description: "A viral infection of the upper respiratory tract",
      symptoms: ["runny nose", "cough", "sore throat", "fatigue"]
    },
    {
      name: "Seasonal Allergies",
      confidence: 65,
      description: "Allergic reaction to environmental allergens",
      symptoms: ["sneezing", "runny nose", "itchy eyes", "congestion"]
    },
    {
      name: "Sinusitis",
      confidence: 45,
      description: "Inflammation of the sinus cavities",
      symptoms: ["facial pressure", "thick nasal discharge", "headache"]
    }
  ];

  const mockQuestion: Question = {
    id: "1",
    text: "Do you have a fever?",
    type: "yes_no"
  };

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDiseases(mockDiseases);
      setCurrentQuestion(mockQuestion);
      setCurrentStep('diagnosis');
      setIsLoading(false);
    }, 2000);
  };

  const handleQuestionAnswer = (answer: string) => {
    // Update confidence levels based on answer
    const updatedDiseases = diseases.map(disease => {
      if (disease.name === "Common Cold" && answer === "yes") {
        return { ...disease, confidence: Math.min(95, disease.confidence + 15) };
      }
      if (disease.name === "Seasonal Allergies" && answer === "no") {
        return { ...disease, confidence: Math.max(30, disease.confidence + 10) };
      }
      return disease;
    });
    
    setDiseases(updatedDiseases);
    
    // Check if we have a conclusive diagnosis
    const topDisease = updatedDiseases[0];
    const secondDisease = updatedDiseases[1];
    
    if (topDisease.confidence >= 90 || 
        (topDisease.confidence >= 60 && topDisease.confidence - secondDisease.confidence >= 20)) {
      setCurrentQuestion(null);
    } else {
      // Generate next question (mock)
      setCurrentQuestion({
        id: "2",
        text: "Have you been experiencing this for more than a week?",
        type: "yes_no"
      });
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setSymptoms(transcript);
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
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
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
                  {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                </Button>
                {isLoading && (
                  <div className="mt-4">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2 text-center">Processing your symptoms...</p>
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

            {!currentQuestion && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Analysis Complete
                    </h3>
                    <p className="text-green-700">
                      Based on your responses, we recommend discussing {diseases[0].name} with your healthcare provider.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentStep('welcome');
                  setSymptoms('');
                  setDiseases([]);
                  setCurrentQuestion(null);
                }}
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
