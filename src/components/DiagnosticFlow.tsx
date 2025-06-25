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

const ProcessingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl max-w-xs w-full">
      <div className="text-center spacing-responsive">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <div>
          <h3 className="text-responsive-base font-semibold text-gray-900 dark:text-white mb-1">
            AI Processing...
          </h3>
          <p className="text-responsive-xs text-gray-600 dark:text-gray-400">
            Please wait while we analyze
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
      <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-75"></div>
      <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-150"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center container-responsive">
        <div className="max-w-sm w-full">
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            {/* Logo/Icon */}
            <div className="text-center spacing-responsive">
              <div className="relative inline-block">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h1 className="text-responsive-xl font-bold text-white bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                AI Health Assistant
              </h1>
              <p className="text-blue-200/80 text-responsive-sm leading-relaxed">
                Get instant, personalized health insights powered by advanced medical AI
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 spacing-responsive">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                </div>
                <p className="text-xs text-green-200 font-medium">Instant</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-lg border border-purple-500/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <p className="text-xs text-purple-200 font-medium">AI Powered</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-500/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <p className="text-xs text-blue-200 font-medium">Secure</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={onStart}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white button-responsive font-semibold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="icon-responsive" />
                <span>Start Assessment</span>
                <Send className="icon-responsive" />
              </div>
            </Button>

            {/* Trust Indicators */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4 text-xs text-blue-200/60">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">2-3 min</span>
                <span className="sm:hidden">Fast</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Private</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>Trusted</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-blue-300/60 leading-relaxed px-2">
              This AI assessment provides educational insights only. Always consult healthcare professionals for medical concerns.
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 container-responsive py-4">
      <div className="max-w-lg mx-auto spacing-responsive">
        {/* Progress Header */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-responsive-base font-semibold text-white">Health Assessment</h2>
            <span className="text-responsive-xs text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Main Content */}
        <div className="glass-card spacing-responsive">
          <div className="text-center spacing-responsive">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto">
              <Activity className="icon-responsive text-white" />
            </div>
            <div>
              <h1 className="text-responsive-lg font-bold text-white mb-1">Describe Your Symptoms</h1>
              <p className="text-responsive-xs text-gray-400">Be as detailed as possible for better assessment</p>
            </div>
          </div>

          <div className="spacing-responsive">
            <div className="space-y-2">
              <label className="block text-responsive-xs font-medium text-gray-300">Tell us about your symptoms</label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing persistent headaches for 3 days, along with fatigue and mild nausea..."
                className="min-h-[100px] sm:min-h-[120px] bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-lg resize-none text-sm"
                rows={4}
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white button-responsive font-medium rounded-xl shadow-lg"
            >
              <Send className="icon-responsive mr-2" />
              {isAnalyzing || isProcessing ? 'Analyzing Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisStep: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center container-responsive">
    <div className="max-w-sm w-full text-center spacing-responsive">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
        <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-pulse" />
      </div>
      
      <div className="spacing-responsive">
        <h1 className="text-responsive-lg font-bold text-white">Analyzing Your Health</h1>
        <p className="text-gray-400 text-responsive-xs">Processing symptoms with AI medical knowledge</p>
      </div>
      
      <div className="glass-card">
        <Progress value={progress} className="h-2 bg-gray-700 mb-2" />
        <p className="text-responsive-xs text-gray-400">Processing medical data...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 container-responsive py-4">
      <div className="max-w-md mx-auto spacing-responsive">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-responsive-base font-bold text-white">Diagnostic Assessment</h1>
            <p className="text-responsive-xs text-gray-400">Question {questionHistory.length + 1} • {viableDiseases.length} conditions</p>
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
        <div className="glass-card p-3">
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="glass-card spacing-responsive">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <MessageSquare className="icon-responsive text-white" />
              </div>
              
              <h2 className="text-responsive-base font-semibold text-white mb-2 sm:mb-3">Follow-up Question</h2>
              
              <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                <p className="text-white leading-relaxed text-responsive-sm">{currentQuestion.text}</p>
              </div>
            </div>
            
            {!showCustomAnswer ? (
              <div className="spacing-responsive">
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleAnswerQuestion('yes')}
                      className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white button-responsive rounded-xl"
                      disabled={isProcessing}
                    >
                      <CheckCircle className="icon-responsive mr-2" />
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAnswerQuestion('no')}
                      className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white button-responsive rounded-xl"
                      disabled={isProcessing}
                    >
                      <AlertTriangle className="icon-responsive mr-2" />
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
                  <MessageSquare className="icon-responsive mr-2" />
                  Write detailed answer
                </Button>
              </div>
            ) : (
              <div className="spacing-responsive">
                <Textarea
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Please provide more details..."
                  className="min-h-[80px] bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-lg resize-none text-sm"
                  rows={3}
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
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-responsive-sm font-semibold text-white">Active Conditions</h3>
            <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">{viableDiseases.length}</Badge>
          </div>
          
          <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
            {viableDiseases.map((disease, index) => (
              <div key={disease.id} className="bg-gray-700/50 p-2 sm:p-3 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-white text-responsive-xs">{disease.name}</h4>
                  </div>
                  <Badge className={`text-xs px-2 py-1 ${
                    disease.confidence >= 60 ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                  }`}>
                    {Math.round(disease.confidence)}%
                  </Badge>
                </div>
                <Progress value={disease.confidence} className="h-1.5 bg-gray-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 container-responsive py-4 sm:py-8">
      <div className="max-w-md mx-auto spacing-responsive">
        <div className="text-center spacing-responsive">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-responsive-lg font-bold text-white mb-1 sm:mb-2">Assessment Complete</h1>
            <p className="text-gray-400 text-responsive-xs">Based on your symptoms and responses</p>
          </div>
        </div>

        {/* Main Result */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-700/50 rounded-lg sm:rounded-xl p-4 sm:p-5 spacing-responsive">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center space-x-2">
              <Target className="icon-responsive text-green-400" />
              <h2 className="text-responsive-base font-semibold text-green-100">Most Likely:</h2>
            </div>
            <Badge className="bg-green-600 text-white text-xs px-2 sm:px-3 py-1">
              {Math.round(topDisease?.confidence || 0)}% Confidence
            </Badge>
          </div>
          
          <div>
            <h3 className="text-responsive-lg font-bold text-white mb-1 sm:mb-2">{topDisease?.name}</h3>
            <p className="text-green-200 text-responsive-xs leading-relaxed">{topDisease?.description}</p>
          </div>
        </div>

        {/* Complete Results */}
        <div className="glass-card spacing-responsive">
          <h3 className="text-responsive-sm font-semibold text-white mb-2 sm:mb-3">Complete Assessment Results:</h3>
          <div className="space-y-2">
            {sortedDiseases.map((disease, index) => (
              <div key={disease.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                    index === 0 ? 'bg-green-500' :
                    index === 1 ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-white text-responsive-xs">{disease.name}</span>
                </div>
                <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                  {Math.round(disease.confidence)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-orange-900/40 border border-orange-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-200 text-responsive-xs mb-1">Important Medical Disclaimer</h4>
              <p className="text-orange-300 text-xs leading-relaxed">
                This AI assessment is for informational purposes only. Always consult with a qualified healthcare professional.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={restartDiagnosis}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white button-responsive font-medium rounded-xl"
        >
          <RotateCcw className="icon-responsive mr-2" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

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
