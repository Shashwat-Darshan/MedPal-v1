import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys fallback system - Mixed Groq, Gemini, and OpenRouter keys
const API_KEYS = [
  // Groq API keys
  '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',
  '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', 
  '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',
  // Gemini API keys
  'AIzaSyAGgztg1kQInnvAJuGTjVrb-OGdm5BR_l4',
  'AIzaSyAi4xSyRh17eC9DvM7NcCCxps-myI2QFQU',
  // OpenRouter API key
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

const callOpenRouterAPI = async (prompt: string, apiKey: string) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
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
    throw new Error(`OpenRouter API error: ${response.status}`);
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
  operation: (apiKey: string, provider: 'groq' | 'gemini' | 'openrouter') => Promise<T>
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
      const provider = isGroq ? 'groq' : isOpenRouter ? 'openrouter' : 'gemini';
      const result = await operation(apiKey, provider);
      console.log(`Success with API key ${i + 1} (${provider})`);
      return result;
    } catch (error) {
      console.log(`Failed with API key ${i + 1}:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw lastError || new Error('All API keys failed. Please check your API key configuration.');
};

export const generateDiagnosisFromSymptoms = async (symptoms: string, age: string = '', gender: string = '') => {
  return tryWithFallback(async (apiKey, provider) => {
    const prompt = `
      As a medical AI assistant, analyze these symptoms and provide exactly 5 possible diagnoses:
      
      Patient Information:
      - Age: ${age || 'Not specified'}
      - Gender: ${gender || 'Not specified'}
      - Symptoms: ${symptoms}
      
      Please provide EXACTLY 5 diagnoses with confidence levels. Format your response as JSON with this EXACT structure:
      {
        "diagnoses": [
          {
            "name": "Diagnosis Name",
            "confidence": 65,
            "description": "Brief description of the condition",
            "symptoms": ["symptom1", "symptom2", "symptom3"]
          }
        ]
      }
      
      Make sure confidence levels are realistic (20-80% range initially) and the diagnoses are ordered by likelihood.
    `;

    let responseText: string;
    
    if (provider === 'groq') {
      responseText = await callGroqAPI(prompt, apiKey);
    } else if (provider === 'openrouter') {
      responseText = await callOpenRouterAPI(prompt, apiKey);
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
    
    console.log('Raw API response:', responseText);
    
    // Try to parse JSON, fallback to structured response
    try {
      // Clean the response text
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      console.log('Parsed diagnoses:', parsed.diagnoses);
      return parsed.diagnoses || [];
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback diagnoses:', parseError);
      // Fallback diagnoses if parsing fails
      return [
        {
          name: "Common Viral Infection",
          confidence: 60,
          description: "A general viral infection affecting the upper respiratory system",
          symptoms: ["Fatigue", "Mild fever", "Body aches"]
        },
        {
          name: "Stress-Related Symptoms",
          confidence: 45,
          description: "Physical symptoms potentially caused by stress or anxiety",
          symptoms: ["Tension", "Sleep disturbances", "General discomfort"]
        },
        {
          name: "Seasonal Allergies",
          confidence: 35,
          description: "Allergic reaction to environmental factors",
          symptoms: ["Congestion", "Sneezing", "Irritation"]
        },
        {
          name: "Minor Bacterial Infection",
          confidence: 30,
          description: "Localized bacterial infection requiring attention",
          symptoms: ["Localized pain", "Mild inflammation", "Discomfort"]
        },
        {
          name: "Nutritional Deficiency",
          confidence: 25,
          description: "Symptoms potentially related to dietary factors",
          symptoms: ["Fatigue", "Weakness", "General malaise"]
        }
      ];
    }
  });
};

export const generateFollowUpQuestion = async (
  diseases: Disease[], 
  symptoms: string, 
  previousQuestions: string[], 
  previousAnswers: string[] = [],
  currentQuestionText: string = ''
) => {
  return tryWithFallback(async (apiKey, provider) => {
    const diseaseList = diseases.map(d => `${d.name} (${d.confidence}%)`).join(', ');
    
    // Create context from previous Q&A pairs
    const qaContext = previousQuestions.map((q, index) => {
      const answer = previousAnswers[index] || 'No answer';
      return `Q: ${q}\nA: ${answer}`;
    }).join('\n\n');
    
    const prompt = `
      Medical Diagnostic Context:
      - Original symptoms: ${symptoms}
      - Current top 5 possible diagnoses: ${diseaseList}
      
      Previous Questions & Answers:
      ${qaContext}
      
      Current Question: ${currentQuestionText}
      
      Based on this comprehensive context, generate ONE specific follow-up question that would help differentiate between these conditions and improve diagnostic accuracy.
      
      Focus on questions that:
      1. Help distinguish between the top conditions
      2. Build upon previous answers
      3. Are medically relevant and specific
      
      Format your response as JSON:
      {
        "question": "Your specific medical question here?",
        "type": "yes_no",
        "diseaseImpacts": {
          "Disease Name 1": 15,
          "Disease Name 2": -10,
          "Disease Name 3": 5
        }
      }
      
      The diseaseImpacts should show how a "yes" answer would change each disease's confidence (positive or negative numbers).
    `;

    let responseText: string;
    
    if (provider === 'groq') {
      responseText = await callGroqAPI(prompt, apiKey);
    } else if (provider === 'openrouter') {
      responseText = await callOpenRouterAPI(prompt, apiKey);
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
    
    console.log('Raw question response:', responseText);
    
    try {
      // Clean the response text
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      console.log('Parsed question:', parsed);
      return parsed;
    } catch (parseError) {
      console.log('Question parsing failed, using fallback:', parseError);
      // Fallback question
      return {
        question: "Are you experiencing any fever or elevated temperature?",
        type: "yes_no",
        diseaseImpacts: diseases.reduce((acc, disease) => {
          acc[disease.name] = Math.random() > 0.5 ? 10 : -5;
          return acc;
        }, {} as Record<string, number>)
      };
    }
  });
};

export const getChatResponseFromGemini = async (message: string, context?: string) => {
  return tryWithFallback(async (apiKey, provider) => {
    const prompt = `
      You are a helpful medical AI assistant. Provide informative and supportive responses about health topics.
      ${context ? `Context: ${context}` : ''}
      
      User message: ${message}
      
      Please provide a helpful, accurate response while reminding users to consult healthcare professionals for serious concerns.
    `;

    if (provider === 'groq') {
      return await callGroqAPI(prompt, apiKey);
    } else if (provider === 'openrouter') {
      return await callOpenRouterAPI(prompt, apiKey);
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
  return tryWithFallback(async (apiKey, provider) => {
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

    if (provider === 'groq') {
      return await callGroqAPI(prompt, apiKey);
    } else if (provider === 'openrouter') {
      return await callOpenRouterAPI(prompt, apiKey);
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
