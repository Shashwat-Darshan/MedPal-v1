
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys fallback system - Mixed Groq and Gemini keys
const API_KEYS = [
  // Your new Groq API keys
  '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',
  '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', 
  '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',
  // Gemini API keys
  'AIzaSyAGgztg1kQInnvAJuGTjVrb-OGdm5BR_l4',
  'AIzaSyAi4xSyRh17eC9DvM7NcCCxps-myI2QFQU',
  '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'
];

const getApiKeys = () => {
  const keys = [...API_KEYS];
  const localKey = localStorage.getItem('gemini_api_key');
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (localKey) keys.unshift(localKey);
  if (envKey) keys.unshift(envKey);
  
  return [...new Set(keys)]; // Remove duplicates
};

const createGenAI = (apiKey: string) => {
  // Skip keys that are not valid Gemini API keys
  if (apiKey.startsWith('sk-or-v1-') || apiKey.startsWith('gsk_')) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const callGroqAPI = async (prompt: string, apiKey: string) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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

const tryWithFallback = async <T>(
  operation: (apiKey: string, isGroq: boolean) => Promise<T>
): Promise<T> => {
  const apiKeys = getApiKeys();
  console.log('Available API keys:', apiKeys.length);
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`Trying API key ${i + 1}/${apiKeys.length}...`);
    
    const isGroq = apiKey.startsWith('gsk_');
    const isOpenRouter = apiKey.startsWith('sk-or-v1-');
    const isGemini = apiKey.startsWith('AIza');
    
    if (!isGroq && !isOpenRouter && !isGemini) {
      console.log(`Skipping invalid API key format: ${apiKey.substring(0, 10)}...`);
      continue;
    }
    
    try {
      const result = await operation(apiKey, isGroq || isOpenRouter);
      console.log(`Success with API key ${i + 1}`);
      return result;
    } catch (error) {
      console.log(`Failed with API key ${i + 1}:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw lastError || new Error('All API keys failed. Please check your API key configuration.');
};

export const analyzeSymptomsWithGemini = async (symptoms: string, age: string = '', gender: string = '') => {
  return tryWithFallback(async (apiKey, isGroq) => {
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

    let responseText: string;
    
    if (isGroq) {
      responseText = await callGroqAPI(prompt, apiKey);
    } else {
      const genAI = createGenAI(apiKey);
      if (!genAI) {
        throw new Error('Invalid Gemini API key format');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
    }
    
    // Try to parse JSON, fallback to structured response
    try {
      return JSON.parse(responseText);
    } catch {
      return {
        diagnosis: "Unable to determine specific diagnosis",
        confidence: 50,
        possibleCauses: ["Multiple factors possible"],
        recommendations: ["Consult healthcare provider"],
        warningSigns: ["Worsening symptoms"]
      };
    }
  });
};

export const getChatResponseFromGemini = async (message: string, context?: string) => {
  return tryWithFallback(async (apiKey, isGroq) => {
    const prompt = `
      You are a helpful medical AI assistant. Provide informative and supportive responses about health topics.
      ${context ? `Context: ${context}` : ''}
      
      User message: ${message}
      
      Please provide a helpful, accurate response while reminding users to consult healthcare professionals for serious concerns.
    `;

    if (isGroq) {
      return await callGroqAPI(prompt, apiKey);
    } else {
      const genAI = createGenAI(apiKey);
      if (!genAI) {
        throw new Error('Invalid Gemini API key format');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  });
};

const chatAboutDiagnosis = async (
  diagnosisContext: string, 
  message: string, 
  previousMessages: ChatMessage[]
): Promise<string> => {
  return tryWithFallback(async (apiKey, isGroq) => {
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

    if (isGroq) {
      return await callGroqAPI(prompt, apiKey);
    } else {
      const genAI = createGenAI(apiKey);
      if (!genAI) {
        throw new Error('Invalid Gemini API key format');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  });
};

export const geminiService = {
  chatAboutDiagnosis
};
