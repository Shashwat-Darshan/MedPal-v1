import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle, RotateCcw, Stethoscope, Target, Sparkles, Heart, MessageSquare, Shield, Zap, Clock } from 'lucide-react';
import { useDiagnosticFlow, Disease, DiagnosticQuestion } from '@/hooks/useDiagnosticFlow';
import { generateDiagnosisFromSymptoms, generateFollowUpQuestion } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const ProcessingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI Processing...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we analyze your response
          </p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const InitialStep: React.FC<{ onStart: () => void; isProcessing: boolean }> = ({ onStart, isProcessing }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-75"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-150"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                AI Health Assistant
              </h1>
              <p className="text-blue-200/80 text-base leading-relaxed">
                Get instant, personalized health insights powered by advanced medical AI
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-green-500/20">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-xs text-green-200 font-medium">Instant Analysis</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-xs text-purple-200 font-medium">AI Powered</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-xs text-blue-200 font-medium">Secure & Private</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={onStart}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="h-5 w-5" />
                <span>Start Health Assessment</span>
                <Send className="h-5 w-5" />
              </div>
            </Button>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-blue-200/60">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>2-3 minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>Trusted by thousands</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-blue-300/60 leading-relaxed">
              This AI assessment provides educational insights only and should not replace professional medical advice. 
              Always consult healthcare professionals for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SymptomsStep: React.FC<{
  symptoms: string;
  setSymptoms: React.Dispatch<React.SetStateAction<string>>;
  severityValue: number[];
  setSeverityValue: React.Dispatch<React.SetStateAction<number[]>>;
  onSubmit: () => void;
  isAnalyzing: boolean;
  isProcessing: boolean;
  progress: number;
}> = ({ symptoms, setSymptoms, severityValue, setSeverityValue, onSubmit, isAnalyzing, isProcessing, progress }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-lg mx-auto space-y-4 pt-6">
        {/* Progress Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Health Assessment</h2>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-5">
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
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-300">Duration</label>
                <select 
                  disabled={isProcessing}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-sm focus:border-blue-500"
                >
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
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSubmit}
              disabled={!symptoms.trim() || isAnalyzing || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-base font-medium rounded-xl shadow-lg"
            >
              <Send className="h-5 w-5 mr-2" />
              {isAnalyzing || isProcessing ? 'Analyzing Your Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisStep: React.FC<{ progress: number }> = ({ progress }) => (
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

const QuestionsStep: React.FC<{
  currentQuestion: DiagnosticQuestion | null;
  showCustomAnswer: boolean;
  setShowCustomAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  customAnswer: string;
  setCustomAnswer: React.Dispatch<React.SetStateAction<string>>;
  handleAnswerQuestion: (answer: string) => void;
  handleCustomAnswerSubmit: () => void;
  restartDiagnosis: () => void;
  questionHistory: string[];
  diseases: Disease[];
  progress: number;
  isProcessing: boolean;
}> = ({
  currentQuestion,
  showCustomAnswer,
  setShowCustomAnswer,
  customAnswer,
  setCustomAnswer,
  handleAnswerQuestion,
  handleCustomAnswerSubmit,
  restartDiagnosis,
  questionHistory,
  diseases,
  progress,
  isProcessing
}) => {
  const viableDiseases = diseases.filter(d => d.confidence > 0).sort((a, b) => b.confidence - a.confidence);

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
            disabled={isProcessing}
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
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAnswerQuestion('no')}
                      className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-3 rounded-xl"
                      disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCustomAnswerSubmit}
                    disabled={!customAnswer.trim() || isProcessing}
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
                    disabled={isProcessing}
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

const ResultsStep: React.FC<{
  diseases: Disease[];
  restartDiagnosis: () => void;
}> = ({ diseases, restartDiagnosis }) => {
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
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);

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
      setIsProcessing(false);
    }
  };

  const generateNextQuestion = async (currentDiseases: Disease[], history: string[], previousAnswers: string[]) => {
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    setIsProcessing(true);
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
        setIsProcessing(false);
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

  return (
    <div className="w-full">
      {isProcessing && <ProcessingOverlay />}
      {currentStep === 'initial' && <InitialStep onStart={handleStartDiagnosis} isProcessing={isProcessing} />}
      {currentStep === 'symptoms' && (
        <SymptomsStep
          symptoms={symptoms}
          setSymptoms={setSymptoms}
          severityValue={severityValue}
          setSeverityValue={setSeverityValue}
          onSubmit={handleSymptomsSubmit}
          isAnalyzing={isAnalyzing}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}
      {currentStep === 'analysis' && <AnalysisStep progress={progress} />}
      {currentStep === 'questions' && (
        <QuestionsStep
          currentQuestion={currentQuestion}
          showCustomAnswer={showCustomAnswer}
          setShowCustomAnswer={setShowCustomAnswer}
          customAnswer={customAnswer}
          setCustomAnswer={setCustomAnswer}
          handleAnswerQuestion={handleAnswerQuestion}
          handleCustomAnswerSubmit={handleCustomAnswerSubmit}
          restartDiagnosis={restartDiagnosis}
          questionHistory={questionHistory}
          diseases={diseases}
          progress={progress}
          isProcessing={isProcessing}
        />
      )}
      {currentStep === 'results' && (
        <ResultsStep
          diseases={diseases}
          restartDiagnosis={restartDiagnosis}
        />
      )}
    </div>
  );
};

export default DiagnosticFlow;
