
import { useState, useCallback } from 'react';

export interface Disease {
  id: string;
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice' | 'severity';
  options?: string[];
  diseaseImpact: Record<string, number>; // disease id -> confidence change
}

export interface SessionData {
  question?: string;
  answer?: string;
  timestamp?: string;
  finalResults?: Disease[];
  completedAt?: string;
}

export type DiagnosticStep = 'initial' | 'symptoms' | 'analysis' | 'questions' | 'results';

export const useDiagnosticFlow = () => {
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('initial');
  const [symptoms, setSymptoms] = useState('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestion | null>(null);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [answerHistory, setAnswerHistory] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const shouldEndDiagnosis = useCallback(() => {
    if (diseases.length === 0) return false;
    
    const sortedDiseases = [...diseases].sort((a, b) => b.confidence - a.confidence);
    const highest = sortedDiseases[0];
    const secondHighest = sortedDiseases[1];

    // End if any disease is above 90%
    if (highest.confidence >= 90) return true;
    
    // End if difference between top 2 is 20+ and lowest is above 60%
    if (secondHighest && 
        (highest.confidence - secondHighest.confidence >= 20) && 
        secondHighest.confidence >= 60) {
      return true;
    }

    // End after 10 questions to prevent infinite loops
    if (questionHistory.length >= 10) return true;

    return false;
  }, [diseases, questionHistory.length]);

  const updateConfidence = useCallback((answer: string, question: DiagnosticQuestion) => {
    setDiseases(prev => prev.map(disease => {
      const impact = question.diseaseImpact[disease.id] || 0;
      let change = 0;
      
      if (question.type === 'yes_no') {
        if (answer.toLowerCase() === 'yes') {
          change = impact;
        } else if (answer.toLowerCase() === 'no') {
          change = -Math.abs(impact) / 2;
        } else {
          // Custom text answer - use AI analysis for impact
          change = impact * 0.7; // Moderate impact for custom answers
        }
      } else if (question.type === 'severity') {
        const severity = parseInt(answer) || 1;
        change = (impact * severity) / 5; // Scale by severity 1-5
      }
      
      const newConfidence = Math.max(0, Math.min(100, disease.confidence + change));
      return { ...disease, confidence: newConfidence };
    }));
  }, []);

  const calculateProgress = useCallback(() => {
    if (currentStep === 'initial') return 0;
    if (currentStep === 'symptoms') return 20;
    if (currentStep === 'analysis') return 40;
    if (currentStep === 'questions') return 60 + (questionHistory.length * 3);
    if (currentStep === 'results') return 100;
    return 0;
  }, [currentStep, questionHistory.length]);

  const saveSessionData = useCallback((data: SessionData) => {
    try {
      const sessionId = `diagnosis_session_${Date.now()}`;
      const existingData = JSON.parse(localStorage.getItem('diagnosisSession') || '{}');
      
      const sessionData = {
        ...existingData,
        sessionId,
        symptoms,
        diseases: diseases.map(d => ({ ...d })),
        questionAnswerPairs: [
          ...(existingData.questionAnswerPairs || []),
          ...(data.question && data.answer ? [{
            question: data.question,
            answer: data.answer,
            timestamp: data.timestamp
          }] : [])
        ],
        ...(data.finalResults && { finalResults: data.finalResults }),
        ...(data.completedAt && { completedAt: data.completedAt }),
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('diagnosisSession', JSON.stringify(sessionData));
      console.log('Session data saved:', sessionData);
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }, [symptoms, diseases]);

  const restartDiagnosis = useCallback(() => {
    setCurrentStep('initial');
    setSymptoms('');
    setDiseases([]);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setAnswerHistory([]);
    setIsAnalyzing(false);
    
    // Clear session data
    localStorage.removeItem('diagnosisSession');
  }, []);

  return {
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
    progress: calculateProgress(),
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence,
    restartDiagnosis,
    saveSessionData
  };
};
