import { useState, useCallback } from 'react';
import { validateInput, ValidationResult } from '@/services/inputValidationService';
import { saveSession, updateSession } from '@/services/historyService';

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
  const [sessionId, setSessionId] = useState<string>('');
  const [inputValidation, setInputValidation] = useState<ValidationResult | null>(null);

  const shouldEndDiagnosis = useCallback(() => {
    // Filter out diseases with 0% confidence
    const viableDiseases = diseases.filter(d => d.confidence > 0);
    
    if (viableDiseases.length === 0) return true;
    if (viableDiseases.length === 1) return true;
    
    const sortedDiseases = [...viableDiseases].sort((a, b) => b.confidence - a.confidence);
    const highest = sortedDiseases[0];
    const secondHighest = sortedDiseases[1];

    // End if any disease is above 85%
    if (highest.confidence >= 85) return true;
    
    // End if difference between top 2 is 30+ and highest is above 70%
    if (secondHighest && 
        (highest.confidence - secondHighest.confidence >= 30) && 
        highest.confidence >= 70) {
      return true;
    }

    // End after 15 questions to prevent infinite loops
    if (questionHistory.length >= 15) return true;

    return false;
  }, [diseases, questionHistory.length]);

  const updateConfidence = useCallback((answer: string, question: DiagnosticQuestion) => {
    setDiseases(prev => prev.map(disease => {
      const impact = question.diseaseImpact[disease.id] || 0;
      let change = 0;
      
      if (question.type === 'yes_no') {
        if (answer.toLowerCase() === 'yes') {
          // Positive answer: if impact is positive, increase confidence
          // if impact is negative, it means "yes" actually decreases this disease probability
          change = impact;
        } else if (answer.toLowerCase() === 'no') {
          // Negative answer: reverse the impact
          change = -impact;
        } else {
          // Custom text answer - use moderate impact based on AI analysis
          change = impact * 0.6;
        }
      } else if (question.type === 'severity') {
        const severity = parseInt(answer) || 1;
        change = (impact * severity) / 5; // Scale by severity 1-5
      }
      
      const newConfidence = Math.max(0, Math.min(100, disease.confidence + change));
      return { ...disease, confidence: newConfidence };
    }));
  }, []);

  const getViableDiseases = useCallback(() => {
    return diseases.filter(d => d.confidence > 0).sort((a, b) => b.confidence - a.confidence);
  }, [diseases]);

  const calculateProgress = useCallback(() => {
    if (currentStep === 'initial') return 0;
    if (currentStep === 'symptoms') return 20;
    if (currentStep === 'analysis') return 40;
    if (currentStep === 'questions') {
      const viableDiseases = getViableDiseases();
      if (viableDiseases.length <= 1) return 95;
      
      const baseProgress = 50;
      const questionProgress = Math.min(35, questionHistory.length * 3);
      
      // Add bonus progress if we're converging on a diagnosis
      const topDisease = viableDiseases[0];
      const confidenceBonus = Math.max(0, (topDisease?.confidence || 0) - 60) * 0.3;
      
      return Math.min(95, baseProgress + questionProgress + confidenceBonus);
    }
    if (currentStep === 'results') return 100;
    return 0;
  }, [currentStep, questionHistory.length, getViableDiseases]);

  const validateSymptoms = useCallback((inputSymptoms: string): ValidationResult => {
    const validation = validateInput(inputSymptoms);
    setInputValidation(validation);
    console.log('Input validation result:', validation);
    return validation;
  }, []);

  const initializeSession = useCallback(() => {
    const newSessionId = saveSession({
      symptoms: '',
      diseases: [],
      questionAnswerPairs: [],
      timestamp: new Date().toISOString()
    });
    setSessionId(newSessionId);
    return newSessionId;
  }, []);

  const updateSessionData = useCallback((updates: any) => {
    if (sessionId) {
      updateSession(sessionId, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [sessionId]);

  const saveSessionData = useCallback((data: SessionData) => {
    try {
      if (!sessionId) return;
      
      const sessionData = {
        symptoms,
        diseases: diseases.map(d => ({ 
          name: d.name, 
          confidence: d.confidence, 
          description: d.description 
        })),
        questionAnswerPairs: [
          ...(data.question && data.answer ? [{
            question: data.question,
            answer: data.answer,
            timestamp: data.timestamp || new Date().toISOString()
          }] : [])
        ],
        ...(data.finalResults && { finalResults: data.finalResults }),
        ...(data.completedAt && { completedAt: data.completedAt }),
        ...(inputValidation && {
          inputValidation: {
            originalInput: symptoms,
            sanitizedInput: inputValidation.sanitizedInput,
            classification: inputValidation.classification.type,
            issues: inputValidation.classification.issues
          }
        })
      };

      updateSessionData(sessionData);
      console.log('Enhanced session data saved');
    } catch (error) {
      console.error('Error saving enhanced session data:', error);
    }
  }, [symptoms, diseases, sessionId, inputValidation, updateSessionData]);

  const restartDiagnosis = useCallback(() => {
    setCurrentStep('initial');
    setSymptoms('');
    setDiseases([]);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setAnswerHistory([]);
    setIsAnalyzing(false);
    setSessionId('');
    setInputValidation(null);
    
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
    saveSessionData,
    getViableDiseases,
    validateSymptoms,
    inputValidation,
    sessionId,
    initializeSession
  };
};
