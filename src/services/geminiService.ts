
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
  const prompt = `Given the following symptoms: "${symptoms}", what are the possible diseases or conditions?
  Return a JSON array of diagnoses with name, confidence (0-100), description, and potential symptoms.
  Be as accurate as possible.
  
  CRITICAL: Return ONLY valid JSON in this exact format:
  [
    {
      "name": "Disease Name",
      "confidence": 85,
      "description": "A brief description of the disease.",
      "symptoms": ["symptom1", "symptom2"]
    }
  ]`;

  try {
    console.log('Attempting parallel API calls for diagnosis generation...');
    const responses = await makeParallelAPICalls(prompt);

    if (responses.length >= 1) {
      // Use the first response, or synthesize if we have multiple
      let finalResponse = responses[0];
      
      if (responses.length >= 2) {
        console.log('Using Gemini for critical thinking analysis...');
        const criticalThinkingPrompt = `Analyze these diagnosis responses and create the best diagnosis list:

Response 1: ${responses[0]}
Response 2: ${responses[1]}

Create a synthesized JSON array that combines the best elements. Return ONLY valid JSON:
[
  {
    "name": "Disease Name",
    "confidence": 85,
    "description": "A brief description of the disease.",
    "symptoms": ["symptom1", "symptom2"]
  }
]`;

        try {
          finalResponse = await getChatResponseFromGemini(criticalThinkingPrompt);
        } catch (synthError) {
          console.warn('Synthesis failed, using first response:', synthError);
          finalResponse = responses[0];
        }
      }

      console.log('Raw API response:', finalResponse);

      const parsed = extractJsonFromResponse(finalResponse);
      if (parsed && Array.isArray(parsed)) {
        console.log('Parsed diagnoses:', parsed);
        return parsed.map((disease: any, index: number) => ({
          id: `disease_${index + 1}`,
          name: disease.name || 'Unknown Disease',
          confidence: disease.confidence || 50,
          description: disease.description || 'No description available',
          symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [symptoms]
        }));
      }
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
      confidence: 60,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_2',
      name: 'Stress-Related Condition',
      confidence: 40,
      description: 'Symptoms may be related to stress or lifestyle factors.',
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
  console.log('Attempting parallel API calls for question generation...');

  const diseaseList = diseases.map(d => `${d.name}: ${d.confidence}%`).join(', ');
  const historyContext = questionHistory.length > 0 
    ? `Previous questions asked: ${questionHistory.join(', ')}. Previous answers: ${answerHistory.join(', ')}.`
    : '';

  const prompt = `Based on these symptoms: "${symptoms}" and current disease probabilities: ${diseaseList}. ${historyContext}

Generate a specific follow-up question to help differentiate between the most likely conditions. 

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "question": "Your specific diagnostic question here?",
  "diseaseImpacts": {
    "Disease Name 1": 15,
    "Disease Name 2": -10,
    "Disease Name 3": 5
  }
}

The question should be clear, specific, and help distinguish between the top conditions. Disease impacts should be between -20 and +20.`;

  try {
    const responses = await makeParallelAPICalls(prompt);
    
    if (responses.length >= 1) {
      let finalResponse = responses[0];
      
      if (responses.length >= 2) {
        console.log('Using Gemini for critical thinking analysis...');
        const criticalThinkingPrompt = `Analyze these question generation responses and create the best diagnostic question:

Response 1: ${responses[0]}
Response 2: ${responses[1]}

Create a synthesized question that combines the best elements. Return ONLY valid JSON:
{
  "question": "Your synthesized question?",
  "diseaseImpacts": {
    "${diseases[0]?.name || 'Disease 1'}": 10,
    "${diseases[1]?.name || 'Disease 2'}": -5
  }
}`;

        try {
          finalResponse = await getChatResponseFromGemini(criticalThinkingPrompt);
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
      question: "Are you experiencing any nausea or sensitivity to light along with your symptoms?",
      impacts: { "Migraine": 15, "Tension Headache": -5, "Sinusitis": 0 }
    },
    {
      question: "Is the pain constant or does it come and go?",
      impacts: { "Migraine": 10, "Cluster Headache": 15, "Tension Headache": -5 }
    },
    {
      question: "Does the pain feel like pressure or tightness?",
      impacts: { "Tension Headache": 15, "Migraine": -10, "Sinusitis": 5 }
    },
    {
      question: "Have you noticed any triggers that make the symptoms worse?",
      impacts: { "Migraine": 12, "Stress-Related": 8, "General Health Concern": -3 }
    }
  ];

  const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  
  // Map disease names to actual diseases
  const diseaseImpacts: Record<string, number> = {};
  diseases.forEach((disease, index) => {
    const fallbackImpact = Object.values(randomQuestion.impacts)[index] || 0;
    diseaseImpacts[disease.name] = fallbackImpact;
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
