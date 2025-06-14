import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is not set. You can enter your API key in the app settings.');
}

const createGenAI = () => {
  const key = getApiKey();
  return key ? new GoogleGenerativeAI(key) : null;
};

export interface Disease {
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

export const analyzeSymptomsWithGemini = async (symptoms: string, age: string, gender: string) => {
  const genAI = createGenAI();
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please set your API key in the app.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    As a medical AI assistant, analyze these symptoms and provide a preliminary assessment:
    
    Patient Information:
    - Age: ${age || 'Not specified'}
    - Gender: ${gender || 'Not specified'}
    - Symptoms: ${symptoms}
    
    Please provide:
    1. Most likely diagnosis
    2. Confidence level (percentage)
    3. Possible causes
    4. Recommended actions
    5. Warning signs to watch for
    
    Format your response as JSON with the following structure:
    {
      "diagnosis": "primary diagnosis",
      "confidence": 85,
      "possibleCauses": ["cause1", "cause2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "warningSigns": ["sign1", "sign2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON, fallback to structured response
    try {
      return JSON.parse(text);
    } catch {
      return {
        diagnosis: "Unable to determine specific diagnosis",
        confidence: 50,
        possibleCauses: ["Multiple factors possible"],
        recommendations: ["Consult healthcare provider"],
        warningSigns: ["Worsening symptoms"]
      };
    }
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    if (error.message?.includes('403') || error.message?.includes('API Key')) {
      throw new Error('Invalid or missing API key. Please check your Gemini API key configuration.');
    }
    throw new Error('Failed to analyze symptoms');
  }
};

export const getChatResponseFromGemini = async (message: string, context?: string) => {
  const genAI = createGenAI();
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please set your API key in the app.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    You are a helpful medical AI assistant. Provide informative and supportive responses about health topics.
    ${context ? `Context: ${context}` : ''}
    
    User message: ${message}
    
    Please provide a helpful, accurate response while reminding users to consult healthcare professionals for serious concerns.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    if (error.message?.includes('403') || error.message?.includes('API Key')) {
      throw new Error('Invalid or missing API key. Please check your Gemini API key configuration.');
    }
    throw new Error('Failed to get response');
  }
};

const chatAboutDiagnosis = async (
  diagnosisContext: string, 
  message: string, 
  previousMessages: ChatMessage[]
): Promise<string> => {
  const genAI = createGenAI();
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please set your API key in the app.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const conversationHistory = previousMessages
    .slice(-5) // Only include last 5 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  const prompt = `
    You are a helpful medical AI assistant discussing a patient's diagnosis. 
    
    Diagnosis Context: ${diagnosisContext}
    
    Previous conversation:
    ${conversationHistory}
    
    Current user message: ${message}
    
    Please provide a helpful, empathetic response about their diagnosis while always reminding them to consult with healthcare professionals for medical decisions.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in diagnosis chat:', error);
    if (error.message?.includes('403') || error.message?.includes('API Key')) {
      throw new Error('Invalid or missing API key. Please check your Gemini API key configuration.');
    }
    throw new Error('Failed to get chat response');
  }
};

export const geminiService = {
  chatAboutDiagnosis
};
