import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys fallback system - Mixed Groq, Gemini, and OpenRouter keys
const API_KEYS = [
  // Gemini API keys (prioritize these since they're working)
  'AIzaSyAGgztg1kQInnvAJuGTjVrb-OGdm5BR_l4',
  'AIzaSyAi4xSyRh17eC9DvM7NcCCxps-myI2QFQU',
  // Groq API keys (keep these for parallel calls)
  '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',
  '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', 
  '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',
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
  console.log('Attempting Groq API call with key:', apiKey.substring(0, 8) + '...');
  
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
    const errorText = await response.text();
    console.error('Groq API error details:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
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

const callGeminiDirect = async (prompt: string, apiKey: string) => {
  const genAI = createGenAI(apiKey);
  if (!genAI) {
    throw new Error('Invalid Gemini API key format');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
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

// Parallel API call implementation with critical thinking
const callParallelAPIs = async (prompt: string): Promise<string> => {
  const apiKeys = getApiKeys();
  const groqKeys = apiKeys.filter(key => key.startsWith('gsk_'));
  const geminiKeys = apiKeys.filter(key => key.startsWith('AIza'));
  
  console.log('Starting parallel API calls...');
  
  const promises: Promise<{ source: string; response: string }>[] = [];
  
  // Add Groq calls (if keys available)
  if (groqKeys.length > 0) {
    promises.push(
      callGroqAPI(prompt, groqKeys[0])
        .then(response => ({ source: 'groq', response }))
        .catch(error => {
          console.log('Groq call failed:', error);
          return null;
        })
    );
  }
  
  // Add Gemini calls
  if (geminiKeys.length > 0) {
    promises.push(
      callGeminiDirect(prompt, geminiKeys[0])
        .then(response => ({ source: 'gemini', response }))
        .catch(error => {
          console.log('Gemini call failed:', error);
          return null;
        })
    );
  }
  
  // Wait for all calls to complete or timeout after 10 seconds
  const results = await Promise.allSettled(
    promises.map(p => 
      Promise.race([
        p,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ])
    )
  );
  
  // Filter successful results
  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<{ source: string; response: string }> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
  
  console.log(`Received ${successfulResults.length} successful responses`);
  
  if (successfulResults.length === 0) {
    throw new Error('All parallel API calls failed');
  }
  
  // If we have multiple responses, use Gemini for critical thinking
  if (successfulResults.length > 1 && geminiKeys.length > 0) {
    console.log('Using Gemini for critical thinking analysis...');
    
    const criticalThinkingPrompt = `
      As a medical AI with critical thinking capabilities, analyze these multiple AI responses to the same medical query and provide the best synthesized answer.
      
      Original Query: ${prompt}
      
      Responses to analyze:
      ${successfulResults.map((result, index) => `
      Response ${index + 1} (from ${result.source}):
      ${result.response}
      `).join('\n')}
      
      Instructions:
      1. Compare the medical accuracy and completeness of each response
      2. Identify any contradictions or inconsistencies
      3. Synthesize the best elements from all responses
      4. Provide a single, improved response that combines the strongest aspects
      5. Maintain the same format as the original responses
      6. Prioritize medical accuracy and patient safety
      
      Provide your final synthesized response:
    `;
    
    try {
      const synthesizedResponse = await callGeminiDirect(criticalThinkingPrompt, geminiKeys[0]);
      console.log('Critical thinking synthesis completed');
      return synthesizedResponse;
    } catch (error) {
      console.log('Critical thinking failed, using best single response:', error);
      // Fall back to the first successful response
      return successfulResults[0].response;
    }
  }
  
  // Return the single successful response
  return successfulResults[0].response;
};

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
  const prompt = `
    As a medical AI assistant, analyze these symptoms and provide exactly 5 possible diagnoses:
    
    Patient Information:
    - Age: ${age || 'Not specified'}
    - Gender: ${gender || 'Not specified'}
    - Symptoms: ${symptoms}
    
    Please provide EXACTLY 5 diagnoses with realistic confidence levels. Format your response as JSON with this EXACT structure:
    {
      "diagnoses": [
        {
          "name": "Diagnosis Name",
          "confidence": 45,
          "description": "Brief description of the condition",
          "symptoms": ["symptom1", "symptom2", "symptom3"]
        }
      ]
    }
    
    Important guidelines:
    - Start with moderate confidence levels (25-65% range initially)
    - Ensure diagnoses are medically realistic for the given symptoms
    - Order by likelihood but keep confidence levels reasonable for initial assessment
    - Each diagnosis should have distinct symptom patterns
  `;

  try {
    // Try parallel API calls first
    console.log('Attempting parallel API calls for diagnosis generation...');
    const responseText = await callParallelAPIs(prompt);
    
    console.log('Raw API response:', responseText);
    
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      console.log('Parsed diagnoses:', parsed.diagnoses);
      return parsed.diagnoses || [];
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback diagnoses:', parseError);
      return [
        {
          name: "Viral Upper Respiratory Infection",
          confidence: 55,
          description: "Common viral infection affecting the upper respiratory tract",
          symptoms: ["Congestion", "Mild fever", "Fatigue", "Throat irritation"]
        },
        {
          name: "Stress-Related Symptoms",
          confidence: 40,
          description: "Physical symptoms potentially caused by psychological stress",
          symptoms: ["Tension headaches", "Sleep disturbances", "Muscle tension"]
        },
        {
          name: "Seasonal Allergies",
          confidence: 35,
          description: "Allergic reaction to environmental allergens",
          symptoms: ["Nasal congestion", "Sneezing", "Watery eyes"]
        },
        {
          name: "Mild Bacterial Infection",
          confidence: 30,
          description: "Localized bacterial infection requiring medical attention",
          symptoms: ["Localized pain", "Mild inflammation", "Tenderness"]
        },
        {
          name: "Nutritional Deficiency",
          confidence: 25,
          description: "Symptoms potentially related to vitamin or mineral deficiency",
          symptoms: ["Fatigue", "Weakness", "Poor concentration"]
        }
      ];
    }
  } catch (error) {
    console.log('Parallel API calls failed, falling back to sequential:', error);
    // Fall back to the original tryWithFallback approach
    return tryWithFallback(async (apiKey, provider) => {
      let responseText: string;
      
      if (provider === 'groq') {
        responseText = await callGroqAPI(prompt, apiKey);
      } else if (provider === 'openrouter') {
        responseText = await callOpenRouterAPI(prompt, apiKey);
      } else {
        responseText = await callGeminiDirect(prompt, apiKey);
      }
      
      try {
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return parsed.diagnoses || [];
      } catch (parseError) {
        console.log('Fallback: JSON parsing failed, using default diagnoses');
        return [
          {
            name: "Viral Upper Respiratory Infection",
            confidence: 55,
            description: "Common viral infection affecting the upper respiratory tract",
            symptoms: ["Congestion", "Mild fever", "Fatigue", "Throat irritation"]
          },
          {
            name: "Stress-Related Symptoms",
            confidence: 40,
            description: "Physical symptoms potentially caused by psychological stress",
            symptoms: ["Tension headaches", "Sleep disturbances", "Muscle tension"]
          },
          {
            name: "Seasonal Allergies",
            confidence: 35,
            description: "Allergic reaction to environmental allergens",
            symptoms: ["Nasal congestion", "Sneezing", "Watery eyes"]
          },
          {
            name: "Mild Bacterial Infection",
            confidence: 30,
            description: "Localized bacterial infection requiring medical attention",
            symptoms: ["Localized pain", "Mild inflammation", "Tenderness"]
          },
          {
            name: "Nutritional Deficiency",
            confidence: 25,
            description: "Symptoms potentially related to vitamin or mineral deficiency",
            symptoms: ["Fatigue", "Weakness", "Poor concentration"]
          }
        ];
      }
    });
  }
};

export const generateFollowUpQuestion = async (
  diseases: Disease[], 
  symptoms: string, 
  previousQuestions: string[], 
  previousAnswers: string[] = [],
  currentQuestionText: string = ''
) => {
  // Only consider diseases with >0% confidence
  const viableDiseases = diseases.filter(d => d.confidence > 0);
  const diseaseList = viableDiseases.map(d => `${d.name} (${d.confidence}%)`).join(', ');
  
  const qaContext = previousQuestions.map((q, index) => {
    const answer = previousAnswers[index] || 'No answer';
    return `Q: ${q}\nA: ${answer}`;
  }).join('\n\n');
  
  const topDisease = viableDiseases[0];
  const secondDisease = viableDiseases[1];
  
  const prompt = `
    Medical Diagnostic Context:
    - Original symptoms: ${symptoms}
    - Current viable diagnoses: ${diseaseList}
    - Top condition: ${topDisease?.name} (${topDisease?.confidence}%)
    ${secondDisease ? `- Second condition: ${secondDisease?.name} (${secondDisease?.confidence}%)` : ''}
    
    Previous Questions & Answers:
    ${qaContext}
    
    Generate ONE targeted follow-up question that will:
    1. Help distinguish between the top 2-3 conditions
    2. Focus on key differentiating symptoms or characteristics
    3. Provide meaningful confidence adjustments based on medical knowledge
    4. Build logically on previous answers
    
    Question should target specific symptoms, timing, severity, or characteristics that are diagnostically significant.
    
    Format your response as JSON:
    {
      "question": "Specific medical question here?",
      "type": "yes_no",
      "diseaseImpacts": {
        "${topDisease?.name}": 15,
        "${secondDisease?.name}": -12,
        "Other Disease": 8
      }
    }
    
    Disease impacts should be:
    - Higher positive values (10-25) for conditions this question strongly supports
    - Negative values (-10 to -20) for conditions this question rules out
    - Smaller values (3-8) for mild support/opposition
    - Based on actual medical differential diagnosis principles
  `;

  try {
    // Try parallel API calls for question generation too
    console.log('Attempting parallel API calls for question generation...');
    const responseText = await callParallelAPIs(prompt);
    
    console.log('Raw question response:', responseText);
    
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      console.log('Parsed question:', parsed);
      return parsed;
    } catch (parseError) {
      console.log('Question parsing failed, using fallback:', parseError);
      return {
        question: "Have you noticed if your symptoms worsen at specific times of day or in certain environments?",
        type: "yes_no",
        diseaseImpacts: viableDiseases.reduce((acc, disease, index) => {
          acc[disease.name] = index === 0 ? 12 : index === 1 ? -8 : 5;
          return acc;
        }, {} as Record<string, number>)
      };
    }
  } catch (error) {
    console.log('Parallel API calls failed for questions, falling back:', error);
    // Fall back to original approach
    return tryWithFallback(async (apiKey, provider) => {
      let responseText: string;
      
      if (provider === 'groq') {
        responseText = await callGroqAPI(prompt, apiKey);
      } else if (provider === 'openrouter') {
        responseText = await callOpenRouterAPI(prompt, apiKey);
      } else {
        responseText = await callGeminiDirect(prompt, apiKey);
      }
      
      try {
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return parsed;
      } catch (parseError) {
        return {
          question: "Have you noticed if your symptoms worsen at specific times of day or in certain environments?",
          type: "yes_no",
          diseaseImpacts: viableDiseases.reduce((acc, disease, index) => {
            acc[disease.name] = index === 0 ? 12 : index === 1 ? -8 : 5;
            return acc;
          }, {} as Record<string, number>)
        };
      }
    });
  }
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
