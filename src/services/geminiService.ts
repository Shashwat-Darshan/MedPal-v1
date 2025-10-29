import { supabase } from '@/integrations/supabase/client';

export interface Disease {
  id: string;
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}


export const generateDiagnosisFromSymptoms = async (symptoms: string): Promise<Disease[]> => {
  console.log('🏥 Generating diagnosis for:', symptoms);

  try {
    const { data, error } = await supabase.functions.invoke('generate-diagnosis', {
      body: { symptoms }
    });

    if (error) {
      console.error('Error calling generate-diagnosis:', error);
      return generateFallbackDiagnosis(symptoms);
    }

    if (data?.diseases && Array.isArray(data.diseases)) {
      console.log('✅ Diagnoses:', data.diseases.map((d: Disease) => `${d.name} (${d.confidence}%)`));
      return data.diseases;
    }
    
    return generateFallbackDiagnosis(symptoms);
  } catch (error) {
    console.error('💥 Error generating diagnosis:', error);
    return generateFallbackDiagnosis(symptoms);
  }
};

const generateFallbackDiagnosis = (symptoms: string): Disease[] => {
  console.log('🔄 Using fallback diagnosis for:', symptoms);
  return [
    {
      id: '1',
      name: 'General Health Concern',
      confidence: 50,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms]
    },
    {
      id: '2',
      name: 'Stress-Related Condition',
      confidence: 35,
      description: 'Symptoms may be related to stress or lifestyle factors.',
      symptoms: [symptoms]
    },
    {
      id: '3',
      name: 'Minor Infection',
      confidence: 30,
      description: 'Could be related to a minor viral or bacterial infection.',
      symptoms: [symptoms]
    },
    {
      id: '4',
      name: 'Allergic Reaction',
      confidence: 25,
      description: 'May be an allergic response to environmental factors.',
      symptoms: [symptoms]
    },
    {
      id: '5',
      name: 'Fatigue Syndrome',
      confidence: 20,
      description: 'Could be related to fatigue or sleep-related issues.',
      symptoms: [symptoms]
    }
  ];
};

export const generateFollowUpQuestion = async (
  diseases: Disease[],
  symptoms: string,
  questionHistory: string[],
  answerHistory: string[],
  previousQuestion: string = ''
): Promise<{ question: string; diseaseImpacts: Record<string, number> }> => {
  console.log('❓ Generating follow-up question...');
  
  const topDiseases = diseases
    .filter(d => d.confidence > 10)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (topDiseases.length < 2) {
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-follow-up', {
      body: { diseases, symptoms, questionHistory, answerHistory }
    });

    if (error) {
      console.error('Error calling generate-follow-up:', error);
      return generateTargetedFallback(diseases, symptoms, questionHistory);
    }

    if (data?.question && data?.diseaseImpacts) {
      console.log('✅ Question:', data.question);
      return {
        question: data.question,
        diseaseImpacts: data.diseaseImpacts
      };
    }
    
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }
};

const generateTargetedFallback = (
  diseases: Disease[], 
  symptoms: string, 
  questionHistory: string[]
): { question: string; diseaseImpacts: Record<string, number> } => {
  console.log('🎯 Using fallback question');
  
  // Medical question banks based on common symptom patterns
  const medicalQuestions = [
    {
      question: "Have you noticed any specific triggers that make your symptoms worse or better?",
      category: "triggers",
      impacts: [8, -4, 6]
    },
    {
      question: "Are your symptoms constant throughout the day, or do they come and go?",
      category: "pattern",
      impacts: [10, -6, 8]
    },
    {
      question: "Have you experienced any fever, night sweats, or unexplained weight changes recently?",
      category: "systemic",
      impacts: [12, -8, 4]
    },
    {
      question: "Do you have any family history of similar health conditions?",
      category: "family_history",
      impacts: [6, 8, -4]
    },
    {
      question: "Have you traveled anywhere recently or been exposed to anyone who was sick?",
      category: "exposure",
      impacts: [15, -5, 10]
    },
    {
      question: "Are you currently taking any medications, supplements, or have any known allergies?",
      category: "medications",
      impacts: [-2, 12, -6]
    },
    {
      question: "How would you describe your sleep pattern and stress levels lately?",
      category: "lifestyle",
      impacts: [4, -8, 12]
    },
    {
      question: "Have you noticed any changes in your appetite, energy level, or mood?",
      category: "general_health",
      impacts: [6, 5, -10]
    }
  ];

  // Filter out questions we've already asked
  const usedCategories: string[] = questionHistory.map(q => {
    if (q.includes('trigger')) return 'triggers';
    if (q.includes('constant') || q.includes('come and go')) return 'pattern';
    if (q.includes('fever') || q.includes('weight')) return 'systemic';
    if (q.includes('family')) return 'family_history';
    if (q.includes('travel') || q.includes('exposed')) return 'exposure';
    if (q.includes('medication') || q.includes('allergies')) return 'medications';
    if (q.includes('sleep') || q.includes('stress')) return 'lifestyle';
    if (q.includes('appetite') || q.includes('energy')) return 'general_health';
    return '';
  }).filter(cat => cat !== '');

  const availableQuestions = medicalQuestions.filter(q => !usedCategories.includes(q.category));
  const selectedQuestion = availableQuestions.length > 0 
    ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    : medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];

  const diseaseImpacts: Record<string, number> = {};
  const topDiseases = diseases.slice(0, 3);
  
  topDiseases.forEach((disease, index) => {
    diseaseImpacts[disease.name] = selectedQuestion.impacts[index] || 0;
  });

  console.log('🎯 Question:', selectedQuestion.question);
  return {
    question: selectedQuestion.question,
    diseaseImpacts
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('diagnosis-chat', {
      body: { diagnosisContext, userMessage, chatHistory }
    });

    if (error) {
      console.error('Error calling diagnosis-chat:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }

    return data?.reply || 'I apologize, but I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error in chat about diagnosis:', error);
    return 'I apologize, but I encountered an error. Please try rephrasing your question, or consider consulting with a healthcare professional for personalized medical advice.';
  }
};

// Export geminiService object for backward compatibility
export const geminiService = {
  chatAboutDiagnosis,
  generateDiagnosisFromSymptoms,
  generateFollowUpQuestion
};
