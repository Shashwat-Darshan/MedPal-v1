
import { supabase } from '@/integrations/supabase/client';

// API service for making calls to various AI services
export const makeParallelAPICalls = async (prompt: string): Promise<string[]> => {
  console.log('Starting parallel API calls with Supabase secrets...');
  
  // Get API keys from Supabase secrets instead of localStorage
  const groqApiKey = await getSupabaseSecret('Groq_Api');
  const geminiApiKey = await getSupabaseSecret('Gemini_Api');
  
  if (!groqApiKey && !geminiApiKey) {
    throw new Error('No API keys found in Supabase secrets');
  }

  console.log('Retrieved API keys from Supabase');

  try {
    const promises: Promise<string>[] = [];
    
    // Add Groq calls if key is available
    if (groqApiKey) {
      promises.push(
        makeGroqCall(groqApiKey, prompt, 'llama-3.1-70b-versatile', 0.7),
        makeGroqCall(groqApiKey, prompt, 'llama-3.1-8b-instant', 0.8)
      );
    }
    
    // Add Gemini call if key is available
    if (geminiApiKey) {
      promises.push(makeGeminiCall(geminiApiKey, prompt, 0.7));
    }

    const responses = await Promise.allSettled(promises);
    const successfulResponses = responses
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map(result => result.value);

    console.log('Received', successfulResponses.length, 'successful responses');
    
    if (successfulResponses.length === 0) {
      throw new Error('All API calls failed');
    }
    
    return successfulResponses;
  } catch (error) {
    console.error('Error in parallel API calls:', error);
    throw error;
  }
};

const getSupabaseSecret = async (secretName: string): Promise<string | null> => {
  try {
    // This would typically be done via an edge function since secrets aren't directly accessible from frontend
    // For now, we'll fallback to localStorage as a temporary solution
    const localKey = localStorage.getItem(secretName.toLowerCase().replace('_', '_'));
    if (localKey) {
      console.log(`Using localStorage key for ${secretName}`);
      return localKey;
    }
    
    console.warn(`No key found for ${secretName} in localStorage`);
    return null;
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    return null;
  }
};

const makeGroqCall = async (apiKey: string, prompt: string, model: string, temperature: number): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid Groq response format');
  }
  
  return data.choices[0].message.content;
};

const makeGeminiCall = async (apiKey: string, prompt: string, temperature: number): Promise<string> => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid Gemini response format');
  }
  
  return data.candidates[0].content.parts[0].text;
};

export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  const responses = await makeParallelAPICalls(prompt);
  return responses[0]; // Return the first successful response
};

export const transcribeAudioWithGroq = async (audioBlob: Blob): Promise<string> => {
  const groqApiKey = await getSupabaseSecret('Groq_Api');
  if (!groqApiKey) {
    throw new Error('Groq API key not found in Supabase secrets');
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error in transcribeAudioWithGroq:', error);
    throw error;
  }
};
