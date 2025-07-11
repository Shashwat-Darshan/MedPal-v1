import { supabase } from '@/integrations/supabase/client';

// API service for making calls to Gemini AI only
export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  console.log('🚀 Starting Gemini API call...');
  console.log('📝 Prompt:', prompt);
  
  // Get API key from Supabase secrets with fallback to hardcoded key
  const geminiApiKey = await getSupabaseSecret('Gemini_Api') || 'AIzaSyDjacsRaqXk7YQRraVkYMM7h2ICMRN5xzM';
  
  console.log('🔑 Gemini API Key Status:', geminiApiKey ? 'Found' : 'Not Found');
  
  if (!geminiApiKey) {
    console.error('❌ Gemini API key not found');
    throw new Error('Gemini API key not found');
  }

  console.log('✅ Retrieved Gemini API key');

  try {
    const response = await makeGeminiCall(geminiApiKey, prompt, 0.35);
    console.log('✅ Gemini API call successful');
    return response;
  } catch (error) {
    console.error('💥 Error in Gemini API call:', error);
    throw error;
  }
};

const getSupabaseSecret = async (secretName: string): Promise<string | null> => {
  console.log(`🔍 Attempting to retrieve secret: ${secretName}`);
  
  try {
    // This would typically be done via an edge function since secrets aren't directly accessible from frontend
    // For now, we'll fallback to localStorage as a temporary solution
    const localKey = localStorage.getItem(secretName.toLowerCase().replace('_', '_'));
    if (localKey) {
      console.log(`📦 Using localStorage key for ${secretName}`);
      return localKey;
    }
    
    console.warn(`⚠️ No key found for ${secretName} in localStorage`);
    return null;
  } catch (error) {
    console.error(`💥 Error retrieving secret ${secretName}:`, error);
    return null;
  }
};

const makeGeminiCall = async (apiKey: string, prompt: string, temperature: number): Promise<string> => {
  console.log('🧠 Making Gemini API call...');
  console.log('Gemini Request Details:', {
    model: 'gemini-2.5-pro',
    temperature,
    promptLength: prompt.length,
    apiKeyPrefix: apiKey.substring(0, 10) + '...'
  });

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json'
    },
  };

  console.log('📤 Gemini request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('📥 Gemini response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API call failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Gemini API call failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('📄 Gemini raw response:', JSON.stringify(data, null, 2));
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('❌ Invalid Gemini response format:', data);
    throw new Error('Invalid Gemini response format');
  }
  
  const content = data.candidates[0].content.parts[0].text;
  console.log('✅ Gemini extracted content:', content);
  return content;
};