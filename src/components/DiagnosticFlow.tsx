
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDiagnosticFlow, Disease, DiagnosticQuestion } from '@/hooks/useDiagnosticFlow';
import { analyzeSymptomsWithGemini } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

const DiagnosticFlow = () => {
  const { toast } = useToast();
  const {
    currentStep,
    setCurrentStep,
    symptoms,
    setSymptoms,
    diseases,
    setDiseases,
    currentQuestion,
    setCurrentQuestion,
    progress,
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence
  } = useDiagnosticFlow();

  const [severityValue, setSeverityValue] = useState([3]);

  const handleStartDiagnosis = () => {
    setCurrentStep('symptoms');
  };

  const handleSymptomsSubmit = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('analysis');
    setIsAnalyzing(true);

    try {
      const result = await analyzeSymptomsWithGemini(symptoms, '', '');
      
      // Mock disease data with confidence levels
      const mockDiseases: Disease[] = [
        {
          id: '1',
          name: result.diagnosis || 'Common Cold',
          confidence: Math.min(result.confidence || 70, 85),
          description: result.possibleCauses?.[0] || 'Viral infection',
          symptoms: result.recommendations || ['Rest', 'Hydration']
        },
        {
          id: '2',
          name: 'Flu',
          confidence: Math.max((result.confidence || 70) - 15, 45),
          description: 'Influenza virus infection',
          symptoms: ['Fever', 'Body aches', 'Fatigue']
        },
        {
          id: '3',
          name: 'Allergic Reaction',
          confidence: Math.max((result.confidence || 70) - 25, 35),
          description: 'Allergic response to environmental factors',
          symptoms: ['Sneezing', 'Runny nose', 'Itchy eyes']
        },
        {
          id: '4',
          name: 'Sinusitis',
          confidence: Math.max((result.confidence || 70) - 30, 30),
          description: 'Inflammation of sinus cavities',
          symptoms: ['Facial pressure', 'Headache', 'Congestion']
        },
        {
          id: '5',
          name: 'Bacterial Infection',
          confidence: Math.max((result.confidence || 70) - 40, 20),
          description: 'Bacterial respiratory infection',
          symptoms: ['Persistent cough', 'Colored mucus', 'Fever']
        }
      ];

      setDiseases(mockDiseases);
      setCurrentStep('questions');
      generateNextQuestion(mockDiseases);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('symptoms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNextQuestion = (currentDiseases: Disease[]) => {
    // Mock question generation based on top diseases
    const mockQuestion: DiagnosticQuestion = {
      id: Date.now().toString(),
      text: "Have you experienced any fever in the last 24 hours?",
      type: 'yes_no',
      diseaseImpact: {
        '1': -10, // Common cold less likely with fever
        '2': 15,  // Flu more likely with fever
        '3': -5,  // Allergies less likely with fever
        '4': 8,   // Sinusitis somewhat more likely
        '5': 12   // Bacterial infection more likely
      }
    };
    setCurrentQuestion(mockQuestion);
  };

  const handleAnswerQuestion = (answer: string) => {
    if (!currentQuestion) return;

    updateConfidence(answer, currentQuestion);
    
    // Check if we should end diagnosis
    setTimeout(() => {
      if (shouldEndDiagnosis()) {
        setCurrentStep('results');
      } else {
        generateNextQuestion(diseases);
      }
    }, 500);
  };

  const renderInitialStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
        <Brain className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          How can I help you today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          I'm here to help assess your symptoms and provide insights about your health concerns.
        </p>
      </div>
      <Button 
        onClick={handleStartDiagnosis}
        className="medical-gradient text-white px-8 py-3"
        size="lg"
      >
        Start Health Assessment
      </Button>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Describe Your Symptoms
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Tell me about what you're experiencing so I can help with an accurate assessment
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What symptoms are you experiencing?
          </label>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 z-10"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
              className="min-h-[120px] pr-12 glass-light-subtle dark:bg-gray-800"
              rows={5}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            or type below
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </label>
            <select className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800">
              <option>Select duration</option>
              <option>Less than 1 day</option>
              <option>1-3 days</option>
              <option>1 week</option>
              <option>More than 1 week</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity (1-10): {severityValue[0]}
            </label>
            <div className="px-2 py-4">
              <Slider
                value={severityValue}
                onValueChange={setSeverityValue}
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
      </div>

      <Button 
        onClick={handleSymptomsSubmit}
        disabled={!symptoms.trim()}
        className="w-full medical-gradient text-white"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        Start Diagnosis
      </Button>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Activity className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Analyzing Your Symptoms
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Our AI is processing your information to identify potential conditions...
        </p>
      </div>
      <div className="w-full max-w-md mx-auto">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Possible Conditions
          </h3>
          <div className="space-y-3">
            {diseases.sort((a, b) => b.confidence - a.confidence).map((disease, index) => (
              <div key={disease.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {disease.name}
                  </span>
                  <Badge 
                    className={
                      disease.confidence >= 80 ? 'bg-green-100 text-green-800' :
                      disease.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {disease.confidence}%
                  </Badge>
                </div>
                <Progress value={disease.confidence} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {currentQuestion && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Follow-up Question
              </h3>
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-6">
                  <p className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
                    {currentQuestion.text}
                  </p>
                  
                  {currentQuestion.type === 'yes_no' && (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => handleAnswerQuestion('yes')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Yes
                      </Button>
                      <Button 
                        onClick={() => handleAnswerQuestion('no')}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        No
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const topDisease = diseases.sort((a, b) => b.confidence - a.confidence)[0];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Assessment Complete
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your symptoms, here's what I found:
          </p>
        </div>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-green-900 dark:text-green-100">
                Most Likely: {topDisease?.name}
              </span>
              <Badge className="bg-green-600 text-white">
                {topDisease?.confidence}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 dark:text-green-200 mb-4">
              {topDisease?.description}
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  This assessment is for informational purposes only. Please consult with a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-light dark:glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Diagnostic Progress
            </h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className={currentStep === 'symptoms' ? 'text-blue-600 font-medium' : ''}>
              Symptoms
            </span>
            <span className={currentStep === 'questions' ? 'text-blue-600 font-medium' : ''}>
              Questions
            </span>
            <span className={currentStep === 'results' ? 'text-blue-600 font-medium' : ''}>
              Results
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="glass-light dark:glass-card">
        <CardContent className="pt-6">
          {currentStep === 'initial' && renderInitialStep()}
          {currentStep === 'symptoms' && renderSymptomsStep()}
          {currentStep === 'analysis' && renderAnalysisStep()}
          {currentStep === 'questions' && renderQuestionsStep()}
          {currentStep === 'results' && renderResultsStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticFlow;
