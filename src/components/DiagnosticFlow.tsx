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
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <Brain className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            AI Health Assistant
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Get personalized health insights powered by advanced AI technology
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Describe your symptoms and I'll help assess your condition with follow-up questions
          </p>
        </div>
        
        <Button 
          onClick={handleStartDiagnosis}
          className="medical-gradient text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <Stethoscope className="h-5 w-5 mr-3" />
          Start Health Assessment
        </Button>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tell Me About Your Symptoms
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          The more detailed you are, the better I can help assess your condition
        </p>
      </div>

      <Card className="glass-light dark:glass-card border-2 border-blue-100 dark:border-blue-800">
        <CardContent className="p-8 space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Describe your symptoms in detail
            </label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: I've been having a persistent headache for 2 days, feeling tired, and have a slight fever. The headache is worse in the morning and I feel nauseous..."
              className="min-h-[150px] text-lg p-4 glass-light-subtle dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                How long have you had these symptoms?
              </label>
              <select className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-lg focus:border-blue-500 dark:focus:border-blue-400">
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
                Pain/Discomfort Level: {severityValue[0]}/10
              </label>
              <div className="px-3 py-6">
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
            className="w-full medical-gradient text-white py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            size="lg"
          >
            <Send className="h-5 w-5 mr-3" />
            {isAnalyzing ? 'Analyzing Symptoms...' : 'Begin Diagnosis'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-ping mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analyzing Your Symptoms
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Our advanced AI is processing your information to identify potential conditions
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto space-y-3">
          <Progress value={progress} className="h-3 rounded-full" />
          <p className="text-sm text-gray-500">Processing medical data...</p>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      {/* Header with Restart */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Refining Diagnosis
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Answer these questions to improve accuracy
            </p>
          </div>
        </div>
        <Button
          onClick={restartDiagnosis}
          variant="outline"
          className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start Over</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Questions Section - Left Side */}
        <div className="xl:col-span-5 space-y-6">
          {currentQuestion && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-blue-900 dark:text-blue-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <span className="text-lg">Follow-up Question</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xl font-medium text-blue-900 dark:text-blue-100 leading-relaxed">
                  {currentQuestion.text}
                </p>
                
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleAnswerQuestion('yes')}
                      className="bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAnswerQuestion('no')}
                      className="bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      No
                    </Button>
                  </div>
                )}
                
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center font-medium">
                  This helps refine your diagnosis accuracy
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conditions Section - Right Side */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Stethoscope className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Possible Conditions
            </h3>
            <Badge variant="outline" className="text-sm">
              {diseases.length} identified
            </Badge>
          </div>
          
          <div className="space-y-4">
            {diseases.sort((a, b) => b.confidence - a.confidence).map((disease, index) => (
              <Card key={disease.id} className={`transition-all duration-300 hover:shadow-lg ${
                index === 0 ? 'ring-2 ring-green-200 dark:ring-green-700 bg-green-50/50 dark:bg-green-900/10' : 
                'hover:shadow-md'
              }`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {disease.name}
                      </h4>
                    </div>
                    <Badge 
                      className={`text-sm font-semibold px-3 py-1 ${
                        disease.confidence >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        disease.confidence >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {Math.round(disease.confidence)}% match
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Confidence Level
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {disease.confidence}%
                        </span>
                      </div>
                      <Progress 
                        value={disease.confidence} 
                        className="h-3 rounded-full"
                      />
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {disease.description}
                    </p>
                  </div>
                  
                  {index === 0 && disease.confidence >= 80 && (
                    <div className="mt-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        High confidence match - Consider consulting with a healthcare provider
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const sortedDiseases = diseases.sort((a, b) => b.confidence - a.confidence);
    const topDisease = sortedDiseases[0];
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Assessment Complete
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Based on your symptoms and responses, here are the results:
            </p>
          </div>
        </div>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600" />
                <span className="text-green-900 dark:text-green-100">
                  Most Likely: {topDisease?.name}
                </span>
              </div>
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                {Math.round(topDisease?.confidence || 0)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-green-800 dark:text-green-200 leading-relaxed">
              {topDisease?.description}
            </p>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                All Assessment Results:
              </h4>
              <div className="grid gap-3">
                {sortedDiseases.map((disease, index) => (
                  <div key={disease.id} className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/50 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
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

            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h5 className="font-semibold text-orange-800 dark:text-orange-200">
                    Important Medical Disclaimer
                  </h5>
                  <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                    This AI assessment is for informational purposes only and should not replace professional medical advice. 
                    Always consult with a qualified healthcare professional for proper diagnosis, treatment, and medical decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={restartDiagnosis}
                className="medical-gradient text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5 mr-3" />
                Start New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4">
      {/* Progress Header */}
      <Card className="glass-light dark:glass-card shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Diagnostic Progress
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-3 mb-6 rounded-full" />
          <div className="flex justify-between text-sm font-medium">
            <div className={`flex items-center space-x-2 ${currentStep === 'symptoms' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'symptoms' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span>Symptoms</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'questions' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'questions' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span>Questions</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'results' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span>Results</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="glass-light dark:glass-card shadow-xl">
        <CardContent className="p-8">
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
