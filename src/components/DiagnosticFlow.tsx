
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle, RotateCcw, Stethoscope, Target, Sparkles, Heart, MessageSquare } from 'lucide-react';
import { useDiagnosticFlow, Disease, DiagnosticQuestion } from '@/hooks/useDiagnosticFlow';
import { generateDiagnosisFromSymptoms, generateFollowUpQuestion } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const DiagnosticFlow = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    answerHistory,
    setAnswerHistory,
    progress,
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence,
    restartDiagnosis,
    saveSessionData,
    getViableDiseases
  } = useDiagnosticFlow();

  const [severityValue, setSeverityValue] = useState([3]);
  const [showCustomAnswer, setShowCustomAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');

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
      
      await generateNextQuestion(formattedDiseases, [], []);
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

  const generateNextQuestion = async (currentDiseases: Disease[], history: string[], previousAnswers: string[]) => {
    try {
      console.log('Generating next question for diseases:', currentDiseases.map(d => `${d.name}: ${d.confidence}%`));
      
      const viableDiseases = currentDiseases.filter(d => d.confidence > 0);
      
      if (viableDiseases.length === 0) {
        setCurrentStep('results');
        return;
      }
      
      const top3Diseases = viableDiseases
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      
      const questionData = await generateFollowUpQuestion(
        top3Diseases, 
        symptoms, 
        history, 
        previousAnswers,
        currentQuestion?.text || ''
      );
      
      const question: DiagnosticQuestion = {
        id: `q_${Date.now()}`,
        text: questionData.question,
        type: 'yes_no',
        diseaseImpact: {}
      };

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
      
      const viableDiseases = currentDiseases.filter(d => d.confidence > 0);
      const fallbackQuestion: DiagnosticQuestion = {
        id: `fallback_${Date.now()}`,
        text: "Are you experiencing any fever or elevated body temperature?",
        type: 'yes_no',
        diseaseImpact: viableDiseases.reduce((acc, disease, index) => {
          acc[disease.id] = index === 0 ? 15 : index === 1 ? -10 : 5;
          return acc;
        }, {} as Record<string, number>)
      };
      setCurrentQuestion(fallbackQuestion);
    }
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    console.log('Answer received:', answer, 'for question:', currentQuestion.text);

    updateConfidence(answer, currentQuestion);
    
    const newQuestionHistory = [...questionHistory, currentQuestion.id];
    const newAnswerHistory = [...answerHistory, answer];
    
    setQuestionHistory(newQuestionHistory);
    setAnswerHistory(newAnswerHistory);
    
    saveSessionData({
      question: currentQuestion.text,
      answer: answer,
      timestamp: new Date().toISOString()
    });
    
    setShowCustomAnswer(false);
    setCustomAnswer('');
    
    setTimeout(async () => {
      if (shouldEndDiagnosis()) {
        setCurrentStep('results');
        saveSessionData({
          finalResults: diseases.sort((a, b) => b.confidence - a.confidence),
          completedAt: new Date().toISOString()
        });
      } else {
        await generateNextQuestion(diseases, newQuestionHistory, newAnswerHistory);
      }
    }, 1000);
  };

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      handleAnswerQuestion(customAnswer.trim());
    }
  };

  const renderInitialStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">
              Get instant health assessment powered by advanced AI
            </h1>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">AI Assistant Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300">Advanced Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300">Instant Results</span>
            </div>
          </div>
          
          <Button 
            onClick={handleStartDiagnosis}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Send className="h-5 w-5 mr-3" />
            Start Analysis
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-4 pt-6">
        {/* Progress Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Health Assessment</h2>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 space-y-5">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2">Describe Your Symptoms</h1>
              <p className="text-sm text-gray-400">The more detailed you are, the better our AI can assess your condition</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tell us about your symptoms</label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing persistent headaches for the past 3 days, along with fatigue and mild nausea..."
                className="min-h-[120px] bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-xl resize-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-300">Duration</label>
                <select className="w-full p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-sm focus:border-blue-500">
                  <option>Select duration</option>
                  <option>Less than 1 day</option>
                  <option>1-3 days</option>
                  <option>1 week</option>
                  <option>More than 1 week</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-300">Severity: {severityValue[0]}/10</label>
                <div className="px-1 py-2">
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
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSymptomsSubmit}
              disabled={!symptoms.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-base font-medium rounded-xl shadow-lg"
            >
              <Send className="h-5 w-5 mr-2" />
              {isAnalyzing ? 'Analyzing Your Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <Activity className="h-8 w-8 text-white animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-white">Analyzing Your Health</h1>
          <p className="text-gray-400">Processing your symptoms with AI medical knowledge</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <Progress value={progress} className="h-2 bg-gray-700 mb-2" />
          <p className="text-sm text-gray-400">Processing medical data...</p>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => {
    const viableDiseases = getViableDiseases();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-4 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Diagnostic Assessment</h1>
              <p className="text-sm text-gray-400">Question {questionHistory.length + 1} • {viableDiseases.length} conditions remaining</p>
            </div>
            <Button
              onClick={restartDiagnosis}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50">
            <Progress value={progress} className="h-2 bg-gray-700" />
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                
                <h2 className="text-lg font-semibold text-white mb-3">Follow-up Question</h2>
                
                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                  <p className="text-white leading-relaxed">{currentQuestion.text}</p>
                </div>
              </div>
              
              {!showCustomAnswer ? (
                <div className="space-y-3">
                  {currentQuestion.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleAnswerQuestion('yes')}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Yes
                      </Button>
                      <Button 
                        onClick={() => handleAnswerQuestion('no')}
                        className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-3 rounded-xl"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        No
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setShowCustomAnswer(true)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 border-dashed"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write detailed answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Please provide more details about your condition..."
                    className="min-h-[80px] bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-xl resize-none"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCustomAnswerSubmit}
                      disabled={!customAnswer.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-xl"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCustomAnswer(false);
                        setCustomAnswer('');
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Conditions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">Active Conditions</h3>
              <Badge variant="outline" className="border-gray-600 text-gray-300">{viableDiseases.length}</Badge>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {viableDiseases.map((disease, index) => (
                <div key={disease.id} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-white text-sm">{disease.name}</h4>
                    </div>
                    <Badge className={`text-xs px-2 py-1 ${
                      disease.confidence >= 60 ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                    }`}>
                      {Math.round(disease.confidence)}%
                    </Badge>
                  </div>
                  <Progress value={disease.confidence} className="h-1.5 bg-gray-600 mb-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsStep = () => {
    const sortedDiseases = diseases.sort((a, b) => b.confidence - a.confidence);
    const topDisease = sortedDiseases[0];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-6 pt-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2">Assessment Complete</h1>
              <p className="text-gray-400">Based on your symptoms and responses, here are our findings</p>
            </div>
          </div>

          {/* Main Result */}
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-green-400" />
                <h2 className="text-lg font-semibold text-green-100">Most Likely:</h2>
              </div>
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                {Math.round(topDisease?.confidence || 0)}% Confidence
              </Badge>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{topDisease?.name}</h3>
              <p className="text-green-200 text-sm leading-relaxed">{topDisease?.description}</p>
            </div>
          </div>

          {/* Complete Results */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 space-y-3">
            <h3 className="text-base font-semibold text-white">Complete Assessment Results:</h3>
            <div className="space-y-2">
              {sortedDiseases.map((disease, index) => (
                <div key={disease.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-white text-sm">{disease.name}</span>
                  </div>
                  <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                    {Math.round(disease.confidence)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-orange-900/40 border border-orange-700/50 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-200 text-sm mb-1">Important Medical Disclaimer</h4>
                <p className="text-orange-300 text-xs leading-relaxed">
                  This AI assessment is for informational purposes only and should not replace professional medical advice. 
                  Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={restartDiagnosis}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-base font-medium rounded-xl"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {currentStep === 'initial' && renderInitialStep()}
      {currentStep === 'symptoms' && renderSymptomsStep()}
      {currentStep === 'analysis' && renderAnalysisStep()}
      {currentStep === 'questions' && renderQuestionsStep()}
      {currentStep === 'results' && renderResultsStep()}
    </div>
  );
};

export default DiagnosticFlow;
