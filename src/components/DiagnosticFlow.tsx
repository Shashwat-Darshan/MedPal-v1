import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useDiagnosticFlow, Disease, DiagnosticQuestion } from '@/hooks/useDiagnosticFlow';
import { generateDiagnosisFromSymptoms, generateFollowUpQuestion } from '@/services/geminiService';
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
    questionHistory,
    setQuestionHistory,
    progress,
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence,
    restartDiagnosis
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
      console.log('Generating diagnosis from symptoms:', symptoms);
      const diagnosisResults = await generateDiagnosisFromSymptoms(symptoms);
      
      // Convert to our Disease format with IDs
      const formattedDiseases: Disease[] = diagnosisResults.map((result: any, index: number) => ({
        id: (index + 1).toString(),
        name: result.name,
        confidence: result.confidence,
        description: result.description,
        symptoms: result.symptoms || []
      }));

      console.log('Generated diseases:', formattedDiseases);
      setDiseases(formattedDiseases);
      setCurrentStep('questions');
      
      // Generate first question
      await generateNextQuestion(formattedDiseases, []);
    } catch (error) {
      console.error('Analysis error:', error);
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

  const generateNextQuestion = async (currentDiseases: Disease[], history: string[]) => {
    try {
      console.log('Generating next question for diseases:', currentDiseases.map(d => d.name));
      const questionData = await generateFollowUpQuestion(currentDiseases, symptoms, history);
      
      // Convert to our DiagnosticQuestion format
      const question: DiagnosticQuestion = {
        id: `q_${Date.now()}`,
        text: questionData.question,
        type: 'yes_no',
        diseaseImpact: {}
      };

      // Map disease impacts by disease ID instead of name
      if (questionData.diseaseImpacts) {
        currentDiseases.forEach(disease => {
          const impact = questionData.diseaseImpacts[disease.name];
          if (impact !== undefined) {
            question.diseaseImpact[disease.id] = impact;
          }
        });
      }

      console.log('Generated question:', question);
      setCurrentQuestion(question);
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback to a generic question if AI fails
      const fallbackQuestion: DiagnosticQuestion = {
        id: `fallback_${Date.now()}`,
        text: "Are you experiencing any fever or elevated body temperature?",
        type: 'yes_no',
        diseaseImpact: currentDiseases.reduce((acc, disease) => {
          acc[disease.id] = Math.random() > 0.5 ? 10 : -5;
          return acc;
        }, {} as Record<string, number>)
      };
      setCurrentQuestion(fallbackQuestion);
    }
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    console.log('Answer received:', answer, 'for question:', currentQuestion.text);

    // Update confidence based on answer
    updateConfidence(answer, currentQuestion);
    
    // Add question to history
    const newHistory = [...questionHistory, currentQuestion.id];
    setQuestionHistory(newHistory);
    
    // Check if we should end diagnosis after a delay to show the update
    setTimeout(async () => {
      if (shouldEndDiagnosis()) {
        setCurrentStep('results');
      } else {
        // Generate next question
        await generateNextQuestion(diseases, newHistory);
      }
    }, 1000);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Describe Your Symptoms
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tell me about what you're experiencing so I can help with an accurate assessment
          </p>
        </div>
        <Button
          onClick={restartDiagnosis}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Restart</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What symptoms are you experiencing?
          </label>
          <div className="relative">
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever..."
              className="min-h-[120px] glass-light-subtle dark:bg-gray-800"
              rows={5}
            />
          </div>
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
        disabled={!symptoms.trim() || isAnalyzing}
        className="w-full medical-gradient text-white"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        {isAnalyzing ? 'Analyzing...' : 'Start Diagnosis'}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Assessment in Progress
        </h2>
        <Button
          onClick={restartDiagnosis}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Restart</span>
        </Button>
      </div>

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
                    {index + 1}. {disease.name}
                  </span>
                  <Badge 
                    className={
                      disease.confidence >= 80 ? 'bg-green-100 text-green-800' :
                      disease.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {Math.round(disease.confidence)}%
                  </Badge>
                </div>
                <Progress value={disease.confidence} className="h-2 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{disease.description}</p>
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
    const sortedDiseases = diseases.sort((a, b) => b.confidence - a.confidence);
    const topDisease = sortedDiseases[0];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
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
          <Button
            onClick={restartDiagnosis}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>New Assessment</span>
          </Button>
        </div>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-green-900 dark:text-green-100">
                Most Likely: {topDisease?.name}
              </span>
              <Badge className="bg-green-600 text-white">
                {Math.round(topDisease?.confidence || 0)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 dark:text-green-200 mb-4">
              {topDisease?.description}
            </p>
            
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-green-900 dark:text-green-100">All Results:</h4>
              {sortedDiseases.map((disease, index) => (
                <div key={disease.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="text-sm">{index + 1}. {disease.name}</span>
                  <Badge variant="outline">{Math.round(disease.confidence)}%</Badge>
                </div>
              ))}
            </div>

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
