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
    answerHistory,
    setAnswerHistory,
    progress,
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence,
    restartDiagnosis,
    saveSessionData,
    getViableDiseases,
    validateSymptoms,
    inputValidation,
    sessionId,
    initializeSession
  } = useDiagnosticFlow();

  const [severityValue, setSeverityValue] = useState([3]);
  const [showCustomAnswer, setShowCustomAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');

  const handleStartDiagnosis = () => {
    initializeSession();
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

    // Phase 4: Response Validation
    const validation = validateSymptoms(symptoms);
    
    if (!validation.isValid) {
      // Show guidance based on validation issues
      const issueMessage = validation.classification.issues.join('. ');
      const suggestionMessage = validation.classification.suggestions.join('. ');
      
      toast({
        title: "Input Guidance Needed",
        description: `${issueMessage}. ${suggestionMessage}`,
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('analysis');
    setIsAnalyzing(true);

    try {
      console.log('Generating diagnosis with enhanced context:', {
        symptoms: validation.sanitizedInput,
        validation: validation.classification
      });
      
      const diagnosisResults = await generateDiagnosisFromSymptoms(
        validation.sanitizedInput, 
        '', 
        '', 
        validation.classification
      );
      
      const formattedDiseases: Disease[] = diagnosisResults.map((result: any, index: number) => ({
        id: (index + 1).toString(),
        name: result.name,
        confidence: result.confidence,
        description: result.description,
        symptoms: result.symptoms || []
      }));

      console.log('Generated diseases with enhanced prompting:', formattedDiseases);
      setDiseases(formattedDiseases);
      setCurrentStep('questions');
      
      await generateNextQuestion(formattedDiseases, [], []);
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again with clearer symptom descriptions.",
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
      
      // Only consider diseases with >0% confidence
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
      
      // Fallback question focusing on top diseases
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
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-16">
      <div className="max-w-2xl w-full mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Health Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Advanced medical analysis powered by artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Stethoscope className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">Medical Analysis</h3>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Target className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">Smart Questions</h3>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Sparkles className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">Instant Results</h3>
            </div>
          </div>
          
          <Button 
            onClick={handleStartDiagnosis}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Heart className="h-4 w-4 mr-2" />
            Begin Health Assessment
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 shadow-md border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Health Assessment</h2>
              <span className="text-xs text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-1.5 rounded-full" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md mb-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Describe Your Symptoms
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              The more detailed you are, the better our AI can assess your condition
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tell us about your symptoms
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing persistent headaches for the past 3 days, along with fatigue and mild nausea..."
                className="min-h-[120px] text-sm p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm resize-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <select className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-xs focus:border-blue-500 dark:focus:border-blue-400 backdrop-blur-sm">
                  <option>Select duration</option>
                  <option>Less than 1 day</option>
                  <option>1-3 days</option>
                  <option>1 week</option>
                  <option>More than 1 week</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Severity: {severityValue[0]}/10
                </label>
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
            >
              <Send className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing Your Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-16">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Activity className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Analyzing Your Health
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
              Processing your symptoms with AI medical knowledge
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
            <Progress value={progress} className="h-2 rounded-full mb-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Processing medical data...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => {
    const viableDiseases = getViableDiseases();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 py-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Diagnostic Assessment
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Question {questionHistory.length + 1} • {viableDiseases.length} conditions remaining
                    </p>
                  </div>
                </div>
                <Button
                  onClick={restartDiagnosis}
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-4 py-2 border"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Questions Section - 8/12 width */}
            <div className="col-span-8">
              {currentQuestion && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md mb-3">
                        <span className="text-white text-sm font-bold">?</span>
                      </div>
                      
                      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Follow-up Question
                      </h2>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                          {currentQuestion.text}
                        </p>
                      </div>
                    </div>
                    
                    {!showCustomAnswer ? (
                      <div className="space-y-3">
                        {currentQuestion.type === 'yes_no' && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              onClick={() => handleAnswerQuestion('yes')}
                              className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Yes
                            </Button>
                            <Button 
                              onClick={() => handleAnswerQuestion('no')}
                              className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              No
                            </Button>
                          </div>
                        )}
                        
                        <div className="border-t pt-3">
                          <Button
                            onClick={() => setShowCustomAnswer(true)}
                            variant="outline"
                            className="w-full py-2 text-xs rounded-lg border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            Write detailed answer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Describe your specific situation:
                          </label>
                          <Textarea
                            value={customAnswer}
                            onChange={(e) => setCustomAnswer(e.target.value)}
                            placeholder="Please provide more details about your condition, symptoms, or any relevant information..."
                            className="min-h-[80px] p-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm resize-none text-xs"
                            rows={4}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCustomAnswerSubmit}
                            disabled={!customAnswer.trim()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 text-xs font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <Send className="h-3 w-3 mr-2" />
                            Submit
                          </Button>
                          <Button
                            onClick={() => {
                              setShowCustomAnswer(false);
                              setCustomAnswer('');
                            }}
                            variant="outline"
                            className="px-4 py-2 rounded-lg border text-xs"
                          >
                            Back
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        💡 Your detailed responses improve diagnostic accuracy
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conditions Section - 4/12 width */}
            <div className="col-span-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl border border-white/20 sticky top-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Active Conditions
                  </h3>
                  <Badge variant="outline" className="ml-auto">
                    {viableDiseases.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {viableDiseases.map((disease, index) => (
                    <div key={disease.id} className={`p-3 rounded-lg transition-all duration-300 ${
                      index === 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700' : 
                      index === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700' :
                      'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {disease.name}
                          </h4>
                        </div>
                        <span className={`text-sm font-bold ${
                          disease.confidence >= 80 ? 'text-green-600' :
                          disease.confidence >= 60 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {Math.round(disease.confidence)}%
                        </span>
                      </div>
                      <Progress value={disease.confidence} className="h-2 mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {disease.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                {viableDiseases.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No viable conditions remaining
                    </p>
                  </div>
                )}
              </div>
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
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg mb-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Assessment Complete
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your symptoms and responses, here are our findings
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-green-600" />
                  <h2 className="text-base font-semibold text-green-900 dark:text-green-100">
                    Most Likely: {topDisease?.name}
                  </h2>
                </div>
                <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                  {Math.round(topDisease?.confidence || 0)}% Confidence
                </Badge>
              </div>
              
              <p className="text-sm text-green-800 dark:text-green-200 mb-4 leading-relaxed">
                {topDisease?.description}
              </p>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Complete Assessment Results:
                </h3>
                <div className="grid gap-2">
                  {sortedDiseases.map((disease, index) => (
                    <div key={disease.id} className="flex justify-between items-center p-2 bg-white/70 dark:bg-gray-700/50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {disease.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {Math.round(disease.confidence)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 text-sm mb-1">
                    Important Medical Disclaimer
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300 text-xs">
                    This AI assessment is for informational purposes only and should not replace professional medical advice. 
                    Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={restartDiagnosis}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Assessment
              </Button>
            </div>
          </div>
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
      
      {/* Input validation feedback */}
      {inputValidation && !inputValidation.isValid && currentStep === 'symptoms' && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 max-w-md shadow-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-2">
                Input Guidance
              </h4>
              <div className="text-yellow-700 dark:text-yellow-300 text-xs space-y-1">
                {inputValidation.classification.suggestions.map((suggestion, index) => (
                  <p key={index}>• {suggestion}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticFlow;
