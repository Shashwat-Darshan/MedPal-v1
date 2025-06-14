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
    saveSessionData
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

  const generateNextQuestion = async (currentDiseases: Disease[], history: string[], previousAnswers: string[]) => {
    try {
      console.log('Generating next question for diseases:', currentDiseases.map(d => d.name));
      
      // Get top 5 diseases with their confidence levels
      const top5Diseases = currentDiseases
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      const questionData = await generateFollowUpQuestion(
        top5Diseases, 
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
      const fallbackQuestion: DiagnosticQuestion = {
        id: `fallback_${Date.now()}`,
        text: "Are you experiencing any fever or elevated temperature?",
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
    
    // Save question-answer pair
    const newQuestionHistory = [...questionHistory, currentQuestion.id];
    const newAnswerHistory = [...answerHistory, answer];
    
    setQuestionHistory(newQuestionHistory);
    setAnswerHistory(newAnswerHistory);
    
    // Save session data including this Q&A
    saveSessionData({
      question: currentQuestion.text,
      answer: answer,
      timestamp: new Date().toISOString()
    });
    
    // Reset custom answer form
    setShowCustomAnswer(false);
    setCustomAnswer('');
    
    setTimeout(async () => {
      if (shouldEndDiagnosis()) {
        setCurrentStep('results');
        // Save final results
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-4xl w-full mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Hero Icon */}
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse mx-auto"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Health Assistant
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
                Advanced medical analysis powered by artificial intelligence
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Describe your symptoms and receive personalized health insights
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Stethoscope className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Medical Analysis</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered assessment</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Target className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Smart Questions</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Targeted inquiries</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Instant Results</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Real-time insights</p>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handleStartDiagnosis}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Heart className="h-5 w-5 mr-2" />
              Begin Health Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Health Assessment</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Describe Your Symptoms
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              The more detailed you are, the better our AI can assess your condition
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300">
                Tell us about your symptoms
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing persistent headaches for the past 3 days, along with fatigue and mild nausea..."
                className="min-h-[150px] text-sm p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm resize-none"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  How long have you had these symptoms?
                </label>
                <select className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-sm focus:border-blue-500 dark:focus:border-blue-400 backdrop-blur-sm">
                  <option>Select duration</option>
                  <option>Less than 1 day</option>
                  <option>1-3 days</option>
                  <option>1 week</option>
                  <option>More than 1 week</option>
                  <option>Several weeks</option>
                  <option>Months</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Severity Level: {severityValue[0]}/10
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
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
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
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            >
              <Send className="h-5 w-5 mr-3" />
              {isAnalyzing ? 'Analyzing Your Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-lg w-full mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse mx-auto"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Activity className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 dark:border-blue-700 rounded-full animate-ping mx-auto"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analyzing Your Health
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Our AI is processing your symptoms and medical knowledge to provide accurate insights
            </p>
          </div>
          
          {/* Progress */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <Progress value={progress} className="h-3 rounded-full mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing medical data...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Refining Your Diagnosis
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Question {questionHistory.length + 1} • {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
              <Button
                onClick={restartDiagnosis}
                variant="outline"
                size="sm"
                className="rounded-lg px-4 py-2 border-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
            <Progress value={progress} className="h-2 rounded-full mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Section - Takes 8 columns */}
          <div className="lg:col-span-8">
            {currentQuestion && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg mb-4">
                      <span className="text-white text-xl font-bold">?</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Follow-up Question
                    </h2>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                      <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                        {currentQuestion.text}
                      </p>
                    </div>
                  </div>
                  
                  {!showCustomAnswer ? (
                    <div className="space-y-4">
                      {/* Standard Yes/No Options */}
                      {currentQuestion.type === 'yes_no' && (
                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            onClick={() => handleAnswerQuestion('yes')}
                            size="lg"
                            className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <CheckCircle className="h-6 w-6 mr-3" />
                            Yes
                          </Button>
                          <Button 
                            onClick={() => handleAnswerQuestion('no')}
                            size="lg"
                            className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <AlertTriangle className="h-6 w-6 mr-3" />
                            No
                          </Button>
                        </div>
                      )}
                      
                      {/* Custom Answer Option */}
                      <div className="border-t pt-4">
                        <Button
                          onClick={() => setShowCustomAnswer(true)}
                          variant="outline"
                          size="lg"
                          className="w-full py-4 text-base rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        >
                          <MessageSquare className="h-5 w-5 mr-3" />
                          Write your own detailed answer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-300">
                          Describe your specific situation:
                        </label>
                        <Textarea
                          value={customAnswer}
                          onChange={(e) => setCustomAnswer(e.target.value)}
                          placeholder="Please provide more details about your condition, symptoms, or any relevant information..."
                          className="min-h-[120px] p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm resize-none text-base"
                          rows={5}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleCustomAnswerSubmit}
                          disabled={!customAnswer.trim()}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <Send className="h-5 w-5 mr-2" />
                          Submit Answer
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCustomAnswer(false);
                            setCustomAnswer('');
                          }}
                          variant="outline"
                          size="lg"
                          className="px-8 py-4 rounded-xl border-2"
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      💡 Your detailed responses help improve diagnostic accuracy
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conditions Sidebar - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 sticky top-6">
              <div className="flex items-center space-x-3 mb-6">
                <Stethoscope className="h-6 w-6 text-indigo-600" />
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
                    index === 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700' : 
                    index === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700' :
                    'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
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
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {disease.name}
                        </h4>
                      </div>
                      <span className={`text-base font-bold ${
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Assessment Complete
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Based on your symptoms and responses, here are our findings
            </p>
          </div>

          <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                    Most Likely: {topDisease?.name}
                  </h2>
                </div>
                <Badge className="bg-green-600 text-white text-sm px-4 py-1 rounded-full">
                  {Math.round(topDisease?.confidence || 0)}% Confidence
                </Badge>
              </div>
              
              <p className="text-sm text-green-800 dark:text-green-200 mb-6 leading-relaxed">
                {topDisease?.description}
              </p>
              
              {/* All Results */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-green-900 dark:text-green-100">
                  Complete Assessment Results:
                </h3>
                <div className="grid gap-3">
                  {sortedDiseases.map((disease, index) => (
                    <div key={disease.id} className="flex justify-between items-center p-3 bg-white/70 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {disease.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {Math.round(disease.confidence)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm mb-1">
                    Important Medical Disclaimer
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300 text-xs">
                    This AI assessment is for informational purposes only and should not replace professional medical advice. 
                    Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={restartDiagnosis}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
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
    </div>
  );
};

export default DiagnosticFlow;
