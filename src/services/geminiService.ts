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

export const generateDiagnosisFromSymptoms = async (symptoms: string, age: string = '', gender: string = '', validationContext?: any) => {
  return tryWithFallback(async (apiKey, provider) => {
    const enhancedPrompt = `
      You are a medical AI assistant performing symptom analysis. Follow these strict guidelines:

      MEDICAL CONTEXT ENFORCEMENT:
      - ONLY respond to genuine symptom descriptions
      - REFUSE to engage with casual conversation, non-medical topics, or assumptions
      - If input contains medical assumptions (like "I have cancer"), redirect to symptom focus
      - Always include medical disclaimers

      SYMPTOM ANALYSIS TASK:
      Patient Information:
      - Age: ${age || 'Not specified'}
      - Gender: ${gender || 'Not specified'}
      - Symptoms: ${symptoms}
      ${validationContext ? `- Input validation: ${JSON.stringify(validationContext)}` : ''}

      RESPONSE REQUIREMENTS:
      - Provide EXACTLY 5 possible medical conditions
      - Base analysis ONLY on symptoms provided, not assumptions
      - Use conservative confidence levels (20-60% range initially)
      - Focus on common conditions first, rare conditions last
      - Include clear descriptions of each condition

      FORMAT (strict JSON):
      {
        "diagnoses": [
          {
            "name": "Medical Condition Name",
            "confidence": 45,
            "description": "Brief medical description focusing on symptoms",
            "symptoms": ["symptom1", "symptom2", "symptom3"]
          }
        ]
      }

      MEDICAL SAFETY:
      - Never provide definitive diagnoses
      - Always recommend professional medical consultation
      - Use appropriate medical terminology
      - Focus on symptom patterns, not specific diseases
    `;

    let responseText: string;
    
    if (provider === 'groq') {
      responseText = await callGroqAPI(enhancedPrompt, apiKey);
    } else if (provider === 'openrouter') {
      responseText = await callOpenRouterAPI(enhancedPrompt, apiKey);
    } else {
      const genAI = createGenAI(apiKey);
      if (!genAI) {
        throw new Error('Invalid Gemini API key format');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      responseText = response.text();
    }
    
    console.log('Enhanced AI response:', responseText);
    
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      return parsed.diagnoses || [];
    } catch (parseError) {
      console.log('JSON parsing failed, using enhanced fallback:', parseError);
      return [
        {
          name: "Upper Respiratory Symptoms",
          confidence: 45,
          description: "Common viral infection affecting nose, throat, and upper airways",
          symptoms: ["Nasal congestion", "Throat irritation", "Mild cough", "Fatigue"]
        },
        {
          name: "Stress-Related Physical Symptoms",
          confidence: 35,
          description: "Physical manifestations potentially related to psychological stress",
          symptoms: ["Tension", "Sleep changes", "Appetite changes", "Muscle tension"]
        },
        {
          name: "Environmental Reaction",
          confidence: 30,
          description: "Symptoms potentially triggered by environmental factors",
          symptoms: ["Respiratory irritation", "Skin sensitivity", "Eye irritation"]
        },
        {
          name: "Minor Inflammatory Response",
          confidence: 25,
          description: "Mild inflammatory reaction in affected areas",
          symptoms: ["Localized discomfort", "Mild swelling", "Sensitivity"]
        },
        {
          name: "Nutritional or Lifestyle Factors",
          confidence: 20,
          description: "Symptoms potentially related to diet, sleep, or activity patterns",
          symptoms: ["Energy changes", "Digestive sensitivity", "General wellness"]
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
  sessionContext?: any
) => {
  return tryWithFallback(async (apiKey, provider) => {
    const viableDiseases = diseases.filter(d => d.confidence > 0);
    const diseaseList = viableDiseases.map(d => `${d.name} (${d.confidence}%)`).join(', ');
    
    const qaContext = previousQuestions.map((q, index) => {
      const answer = previousAnswers[index] || 'No answer';
      return `Q: ${q}\nA: ${answer}`;
    }).join('\n\n');
    
    const topDisease = viableDiseases[0];
    const secondDisease = viableDiseases[1];
    
    const enhancedPrompt = `
      MEDICAL DIAGNOSTIC CONTEXT:
      - Original symptoms: ${symptoms}
      - Current viable conditions: ${diseaseList}
      - Top condition: ${topDisease?.name} (${topDisease?.confidence}%)
      ${secondDisease ? `- Second condition: ${secondDisease?.name} (${secondDisease?.confidence}%)` : ''}
      
      PREVIOUS ASSESSMENT:
      ${qaContext}
      
      QUESTION GENERATION RULES:
      1. Generate ONE specific follow-up question
      2. Focus on distinguishing between top conditions
      3. Ask about SYMPTOMS, not conditions or diseases
      4. Use medically relevant differential diagnosis principles
      5. Target key symptoms that differentiate conditions
      6. Keep questions clear and answerable
      
      RESPONSE FORMAT (strict JSON):
      {
        "question": "Specific symptom-focused question?",
        "type": "yes_no",
        "diseaseImpacts": {
          "${topDisease?.name}": 15,
          "${secondDisease?.name}": -12
        }
      }
      
      IMPACT GUIDELINES:
      - Positive values (10-25): Question supports this condition
      - Negative values (-10 to -25): Question rules out this condition
      - Base impacts on medical differential diagnosis principles
      - Higher absolute values for more definitive questions
    `;

    let responseText: string;
    
    if (provider === 'groq') {
      responseText = await callGroqAPI(enhancedPrompt, apiKey);
    } else if (provider === 'openrouter') {
      responseText = await callOpenRouterAPI(enhancedPrompt, apiKey);
    } else {
      const genAI = createGenAI(apiKey);
      if (!genAI) {
        throw new Error('Invalid Gemini API key format');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      responseText = response.text();
    }
    
    console.log('Enhanced question response:', responseText);
    
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (parseError) {
      console.log('Question parsing failed, using enhanced fallback:', parseError);
      return {
        question: "Are your symptoms worse at specific times of day or in certain situations?",
        type: "yes_no",
        diseaseImpacts: viableDiseases.reduce((acc, disease, index) => {
          acc[disease.name] = index === 0 ? 15 : index === 1 ? -10 : 5;
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
