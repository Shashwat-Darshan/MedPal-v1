import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle, RotateCcw, Stethoscope, Target } from 'lucide-react';
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
    <div className="text-center space-y-8 py-12">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
          <Brain className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
          AI Health Assistant
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Get personalized health insights powered by advanced AI technology
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Describe your symptoms and I'll help assess your condition with intelligent follow-up questions
        </p>
      </div>
      
      <Button 
        onClick={handleStartDiagnosis}
        className="medical-gradient text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        size="lg"
      >
        <Stethoscope className="h-5 w-5 mr-3" />
        Start Health Assessment
      </Button>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl">
          <Activity className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Tell Me About Your Symptoms
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          The more detailed you are, the better I can help assess your condition
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <label className="block text-xl font-semibold text-gray-700 dark:text-gray-300">
            Describe your symptoms in detail
          </label>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever. The headache is worse in the morning and I feel nauseous..."
            className="min-h-[150px] text-lg p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
              Duration
            </label>
            <select className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-lg focus:border-blue-500 dark:focus:border-blue-400">
              <option>Select duration</option>
              <option>Less than 1 day</option>
              <option>1-3 days</option>
              <option>1 week</option>
              <option>More than 1 week</option>
              <option>Several weeks</option>
              <option>Months</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
              Pain/Discomfort Level: {severityValue[0]}/10
            </label>
            <div className="px-2 py-6">
              <Slider
                value={severityValue}
                onValueChange={setSeverityValue}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 - Mild</span>
                <span>5 - Moderate</span>
                <span>10 - Severe</span>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSymptomsSubmit}
          disabled={!symptoms.trim() || isAnalyzing}
          className="w-full medical-gradient text-white py-6 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
          size="lg"
        >
          <Send className="h-6 w-6 mr-4" />
          {isAnalyzing ? 'Analyzing Symptoms...' : 'Begin Diagnosis'}
        </Button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl">
            <Activity className="h-16 w-16 text-white" />
          </div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-blue-200 rounded-full animate-ping mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Analyzing Your Symptoms
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our advanced AI is processing your information to identify potential conditions
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto space-y-4">
          <Progress value={progress} className="h-3 rounded-full" />
          <p className="text-lg text-gray-500">Processing medical data...</p>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Refining Diagnosis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {Math.round(progress)}% complete • Question {questionHistory.length + 1}
            </p>
          </div>
        </div>
        <Button
          onClick={restartDiagnosis}
          variant="outline"
          size="lg"
          className="rounded-xl px-6 py-3"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Start Over
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {currentQuestion && (
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-700 shadow-xl backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg">
                  <span className="text-white text-2xl font-bold">?</span>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Follow-up Question
                  </h3>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl">
                    <p className="text-xl text-blue-900 dark:text-blue-100 leading-relaxed">
                      {currentQuestion.text}
                    </p>
                  </div>
                </div>
                
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-6">
                    <Button 
                      onClick={() => handleAnswerQuestion('yes')}
                      className="bg-green-600 hover:bg-green-700 text-white py-6 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <CheckCircle className="h-6 w-6 mr-3" />
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAnswerQuestion('no')}
                      className="bg-red-600 hover:bg-red-700 text-white py-6 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <AlertTriangle className="h-6 w-6 mr-3" />
                      No
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">
            <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl">
              <Stethoscope className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Possible Conditions
              </h3>
              <Badge variant="outline" className="ml-auto">
                {diseases.length}
              </Badge>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {diseases.sort((a, b) => b.confidence - a.confidence).map((disease, index) => (
                <div key={disease.id} className={`p-4 rounded-xl transition-all duration-300 ${
                  index === 0 ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700' : 
                  index === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700' :
                  'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {disease.name}
                      </h4>
                    </div>
                    <span className={`text-lg font-bold ${
                      disease.confidence >= 80 ? 'text-green-600' :
                      disease.confidence >= 60 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {Math.round(disease.confidence)}%
                    </span>
                  </div>
                  <Progress value={disease.confidence} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const sortedDiseases = diseases.sort((a, b) => b.confidence - a.confidence);
    const topDisease = sortedDiseases[0];
    
    return (
      <div className="space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-2xl shadow-2xl">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Assessment Complete
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Based on your symptoms and responses
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Target className="h-10 w-10 text-green-600" />
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Most Likely: {topDisease?.name}
                </h3>
              </div>
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                {Math.round(topDisease?.confidence || 0)}% Confidence
              </Badge>
            </div>
            
            <p className="text-lg text-green-800 dark:text-green-200 mb-6">
              {topDisease?.description}
            </p>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                All Assessment Results:
              </h4>
              <div className="space-y-3">
                {sortedDiseases.map((disease, index) => (
                  <div key={disease.id} className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {disease.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {Math.round(disease.confidence)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-semibold text-orange-800 dark:text-orange-200 text-lg mb-2">
                  Important Medical Disclaimer
                </h5>
                <p className="text-orange-700 dark:text-orange-300">
                  This AI assessment is for informational purposes only and should not replace professional medical advice. 
                  Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={restartDiagnosis}
              className="medical-gradient text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="h-5 w-5 mr-3" />
              Start New Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Floating Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Health Assessment
            </h1>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className={currentStep === 'symptoms' ? 'text-blue-600' : 'text-gray-400'}>Symptoms</span>
            <span className={currentStep === 'questions' ? 'text-blue-600' : 'text-gray-400'}>Questions</span>
            <span className={currentStep === 'results' ? 'text-blue-600' : 'text-gray-400'}>Results</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {currentStep === 'initial' && renderInitialStep()}
          {currentStep === 'symptoms' && renderSymptomsStep()}
          {currentStep === 'analysis' && renderAnalysisStep()}
          {currentStep === 'questions' && renderQuestionsStep()}
          {currentStep === 'results' && renderResultsStep()}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
