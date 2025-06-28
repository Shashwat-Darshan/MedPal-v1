
import { makeParallelAPICalls, getChatResponseFromGemini, transcribeAudioWithGroq } from './apiService';

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

// Export the functions from apiService for backward compatibility
export { getChatResponseFromGemini, transcribeAudioWithGroq };

const extractJsonFromResponse = (response: string): any => {
  // Try to find JSON in the response
  const jsonMatch = response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  }
  return null;
};

export const generateDiagnosisFromSymptoms = async (symptoms: string): Promise<Disease[]> => {
  const prompt = `Analyze these symptoms: "${symptoms}"

Create exactly 5 possible medical conditions with confidence scores based on the provided symptoms.

CRITICAL: Return ONLY valid JSON in this exact format:
[
  {
    "name": "Condition Name",
    "confidence": 75,
    "description": "Brief medical description of the condition.",
    "symptoms": ["symptom1", "symptom2", "symptom3"]
  },
  {
    "name": "Another Condition",
    "confidence": 60,
    "description": "Brief medical description.",
    "symptoms": ["symptom1", "symptom2"]
  }
]

Requirements:
- Exactly 5 conditions
- Confidence scores should realistically reflect symptom match (0-100)
- Include relevant symptoms for each condition
- Be medically accurate but general (not specific diagnoses)`;

  try {
    console.log('Generating initial diagnosis from symptoms...');
    const responses = await makeParallelAPICalls(prompt);
    
    let finalResponse = responses[0];
    
    if (responses.length >= 2) {
      console.log('Synthesizing multiple responses...');
      const synthesisPrompt = `Analyze these medical assessment responses and create the best combined result:

Response 1: ${responses[0]}
Response 2: ${responses[1]}

Create a synthesized JSON array of exactly 5 conditions that combines the best medical insights. Return ONLY valid JSON:
[
  {
    "name": "Condition Name",
    "confidence": 75,
    "description": "Brief description",
    "symptoms": ["symptom1", "symptom2"]
  }
]`;

      try {
        finalResponse = await getChatResponseFromGemini(synthesisPrompt);
      } catch (synthError) {
        console.warn('Synthesis failed, using first response:', synthError);
        finalResponse = responses[0];
      }
    }

    console.log('Raw diagnosis response:', finalResponse);

    const parsed = extractJsonFromResponse(finalResponse);
    if (parsed && Array.isArray(parsed)) {
      console.log('Parsed diagnoses:', parsed);
      return parsed.map((disease: any, index: number) => ({
        id: `disease_${index + 1}`,
        name: disease.name || 'Unknown Condition',
        confidence: Math.min(100, Math.max(0, disease.confidence || 30)),
        description: disease.description || 'No description available',
        symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [symptoms]
      }));
    }
    
    console.warn('Falling back to default diagnosis');
    return generateFallbackDiagnosis(symptoms);
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return generateFallbackDiagnosis(symptoms);
  }
};

const generateFallbackDiagnosis = (symptoms: string): Disease[] => {
  return [
    {
      id: 'disease_1',
      name: 'General Health Concern',
      confidence: 50,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_2',
      name: 'Stress-Related Condition',
      confidence: 35,
      description: 'Symptoms may be related to stress or lifestyle factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_3',
      name: 'Minor Infection',
      confidence: 30,
      description: 'Could be related to a minor viral or bacterial infection.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_4',
      name: 'Allergic Reaction',
      confidence: 25,
      description: 'May be an allergic response to environmental factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_5',
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
  console.log('Generating targeted follow-up question...');

  const topDiseases = diseases.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  const diseaseContext = topDiseases.map(d => `${d.name}: ${d.confidence}%`).join(', ');
  
  const conversationHistory = questionHistory.length > 0 
    ? `Previous questions: ${questionHistory.join(' | ')}. Previous answers: ${answerHistory.join(' | ')}.`
    : '';

  const prompt = `Medical Context:
- Original symptoms: "${symptoms}"
- Current top conditions: ${diseaseContext}
- ${conversationHistory}

Generate ONE specific diagnostic question to differentiate between the top conditions. The question should help boost confidence in the correct diagnosis.

Example approach: If user has "sore eye" → ask "Did you have any recent eye trauma or injury, or when did you last touch/rub your eyes?"

CRITICAL: Return ONLY valid JSON:
{
  "question": "Your specific diagnostic question here?",
  "diseaseImpacts": {
    "${topDiseases[0]?.name}": 12,
    "${topDiseases[1]?.name}": -8,
    "${topDiseases[2]?.name}": 5
  }
}

Rules:
- Question should be clear and specific
- Disease impacts should be realistic (-15 to +15)
- Focus on differentiating between top conditions`;

  try {
    const responses = await makeParallelAPICalls(prompt);
    
    let finalResponse = responses[0];
    
    if (responses.length >= 2) {
      console.log('Synthesizing question responses...');
      const synthesisPrompt = `Analyze these diagnostic question responses:

Response 1: ${responses[0]}
Response 2: ${responses[1]}

Create the best diagnostic question. Return ONLY valid JSON:
{
  "question": "Best diagnostic question?",
  "diseaseImpacts": {
    "${topDiseases[0]?.name}": 10,
    "${topDiseases[1]?.name}": -5,
    "${topDiseases[2]?.name}": 3
  }
}`;

      try {
        finalResponse = await getChatResponseFromGemini(synthesisPrompt);
      } catch (synthError) {
        console.warn('Question synthesis failed, using first response:', synthError);
        finalResponse = responses[0];
      }
    }

    console.log('Raw question response:', finalResponse);

    const parsed = extractJsonFromResponse(finalResponse);
    if (parsed && parsed.question && parsed.diseaseImpacts) {
      return {
        question: parsed.question,
        diseaseImpacts: parsed.diseaseImpacts
      };
    }
    
    console.warn('Falling back to default question');
    return generateFallbackQuestion(diseases);
  } catch (error) {
    console.error('Error in question generation:', error);
    return generateFallbackQuestion(diseases);
  }
};

const generateFallbackQuestion = (diseases: Disease[]): { question: string; diseaseImpacts: Record<string, number> } => {
  const fallbackQuestions = [
    {
      question: "When did these symptoms first start, and have they gotten worse or better over time?",
      impacts: [12, -5, 8, -3, 5]
    },
    {
      question: "Are you experiencing any fever, chills, or body aches along with these symptoms?",
      impacts: [15, -8, 10, -5, 3]
    },
    {
      question: "Have you been exposed to anyone sick recently, or been in crowded places?",
      impacts: [8, 12, -6, 4, -2]
    },
    {
      question: "Does anything specific make your symptoms better or worse (food, activity, rest)?",
      impacts: [10, -4, 12, -8, 6]
    },
    {
      question: "Are you taking any medications or have any known allergies?",
      impacts: [-3, 8, -5, 15, -2]
    }
  ];

  const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  
  const diseaseImpacts: Record<string, number> = {};
  diseases.slice(0, 5).forEach((disease, index) => {
    diseaseImpacts[disease.name] = randomQuestion.impacts[index] || 0;
  });
  
  return {
    question: randomQuestion.question,
    diseaseImpacts
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const history = chatHistory
    .slice(-6) // Keep last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful AI assistant providing information about medical diagnoses.
  
Context: ${diagnosisContext}

Recent conversation:
${history}

User question: ${userMessage}

Provide a concise, helpful, and supportive response. Remember to always recommend consulting healthcare professionals for medical advice.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    return response;
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
