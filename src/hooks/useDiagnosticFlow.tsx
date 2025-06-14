
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

export type DiagnosticStep = 'initial' | 'symptoms' | 'analysis' | 'questions' | 'results';

export const useDiagnosticFlow = () => {
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('initial');
  const [symptoms, setSymptoms] = useState('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestion | null>(null);
  const [progress, setProgress] = useState(0);
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

    return false;
  }, [diseases]);

  const updateConfidence = useCallback((answer: string, question: DiagnosticQuestion) => {
    setDiseases(prev => prev.map(disease => {
      const impact = question.diseaseImpact[disease.id] || 0;
      let change = 0;
      
      if (question.type === 'yes_no') {
        change = answer === 'yes' ? impact : -Math.abs(impact) / 2;
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
    if (currentStep === 'questions') return 60 + (diseases.length > 0 ? Math.min(30, diseases[0].confidence * 0.3) : 0);
    if (currentStep === 'results') return 100;
    return 0;
  }, [currentStep, diseases]);

  return {
    currentStep,
    setCurrentStep,
    symptoms,
    setSymptoms,
    diseases,
    setDiseases,
    currentQuestion,
    setCurrentQuestion,
    progress: calculateProgress(),
    isAnalyzing,
    setIsAnalyzing,
    shouldEndDiagnosis,
    updateConfidence
  };
};
