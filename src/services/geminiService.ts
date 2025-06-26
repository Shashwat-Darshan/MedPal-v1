
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

// Export the functions from apiService
export { getChatResponseFromGemini, transcribeAudioWithGroq };

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
    },
    ...
  ]`;

  try {
    console.log('Attempting parallel API calls for diagnosis generation...');
    const responses = await makeParallelAPICalls(prompt);

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
  },
  ...
]`;

      const synthesizedResponse = await getChatResponseFromGemini(criticalThinkingPrompt);
      console.log('Critical thinking synthesis completed');
      console.log('Raw API response:', synthesizedResponse);

      try {
        // Extract JSON from the response
        const jsonMatch = synthesizedResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Parsed diagnoses:', parsed);
          return parsed.map((disease: any, index: number) => ({
            id: `disease_${index + 1}`,
            ...disease
          }));
        }
        throw new Error('Invalid diagnosis format in synthesized response');
      } catch (parseError) {
        console.error('Diagnosis parsing failed:', parseError);
        return [];
      }
    } else {
      throw new Error('Insufficient responses for synthesis');
    }
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return [];
  }
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
    
    if (responses.length >= 2) {
      console.log('Using Gemini for critical thinking analysis...');
      
      const criticalThinkingPrompt = `Analyze these question generation responses and create the best diagnostic question:

Response 1: ${responses[0]}
Response 2: ${responses[1]}

Create a synthesized question that combines the best elements. Return ONLY valid JSON:
{
  "question": "Your synthesized question?",
  "diseaseImpacts": {
    "Disease Name": impact_number
  }
}`;

      const synthesizedResponse = await getChatResponseFromGemini(criticalThinkingPrompt);
      console.log('Critical thinking synthesis completed');
      console.log('Raw question response:', synthesizedResponse);

      try {
        // Extract JSON from the response
        const jsonMatch = synthesizedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.question && parsed.diseaseImpacts) {
            return {
              question: parsed.question,
              diseaseImpacts: parsed.diseaseImpacts
            };
          }
        }
        throw new Error('Invalid question format in synthesized response');
      } catch (parseError) {
        console.error('Question parsing failed, using fallback:', parseError);
        return generateFallbackQuestion(diseases);
      }
    } else {
      throw new Error('Insufficient responses for synthesis');
    }
  } catch (error) {
    console.error('Error in question generation:', error);
    return generateFallbackQuestion(diseases);
  }
};

const generateFallbackQuestion = (diseases: Disease[]): { question: string; diseaseImpacts: Record<string, number> } => {
  const fallbackQuestions = [
    {
      question: "Are you experiencing any nausea or sensitivity to light along with your headache?",
      impacts: { "Migraine": 15, "Tension Headache": -5, "Sinusitis": 0 }
    },
    {
      question: "Is the pain on one side of your head or both sides?",
      impacts: { "Migraine": 10, "Cluster Headache": 15, "Tension Headache": -5 }
    },
    {
      question: "Does the headache feel like pressure or tightness around your head?",
      impacts: { "Tension Headache": 15, "Migraine": -10, "Sinusitis": 5 }
    }
  ];

  const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  
  return {
    question: randomQuestion.question,
    diseaseImpacts: randomQuestion.impacts
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const history = chatHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful AI assistant providing information about medical diagnoses.
  Here is context about the diagnosis: ${diagnosisContext}
  Here is the current chat history: ${history}
  The user is asking: ${userMessage}
  Provide a concise and helpful response.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    return response;
  } catch (error) {
    console.error('Error in chat about diagnosis:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

// Export geminiService object for backward compatibility
export const geminiService = {
  chatAboutDiagnosis,
  generateDiagnosisFromSymptoms,
  generateFollowUpQuestion
};
