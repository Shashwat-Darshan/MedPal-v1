
import { supabase } from '@/integrations/supabase/client';

// API service for making calls to various AI services
export const makeParallelAPICalls = async (prompt: string): Promise<string[]> => {
  console.log('🚀 Starting parallel API calls with Supabase secrets...');
  console.log('📝 Prompt:', prompt);
  
  // Get API keys from Supabase secrets instead of localStorage
  const groqApiKey = await getSupabaseSecret('Groq_Api');
  const geminiApiKey = await getSupabaseSecret('Gemini_Api');
  
  console.log('🔑 API Keys Status:', {
    groqApiKey: groqApiKey ? 'Found' : 'Not Found',
    geminiApiKey: geminiApiKey ? 'Found' : 'Not Found'
  });
  
  if (!groqApiKey && !geminiApiKey) {
    console.error('❌ No API keys found in Supabase secrets');
    throw new Error('No API keys found in Supabase secrets');
  }

  console.log('✅ Retrieved API keys from Supabase');

  try {
    const promises: Promise<string>[] = [];
    
    // Add Groq calls if key is available
    if (groqApiKey) {
      console.log('🤖 Adding Groq API calls...');
      promises.push(
        makeGroqCall(groqApiKey, prompt, 'compound-beta', 0.26)
      );
    }
    
    // Add Gemini call if key is available
    if (geminiApiKey) {
      console.log('🧠 Adding Gemini API call...');
      promises.push(makeGeminiCall(geminiApiKey, prompt, 0.35));
    }

    console.log(`📡 Making ${promises.length} API calls in parallel...`);
    const responses = await Promise.allSettled(promises);
    
    console.log('📊 API Responses Status:', responses.map((r, i) => ({
      index: i,
      status: r.status,
      success: r.status === 'fulfilled'
    })));

    const successfulResponses = responses
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map(result => result.value);

    console.log('✅ Successful responses count:', successfulResponses.length);
    console.log('📄 Successful responses:', successfulResponses);
    
    if (successfulResponses.length === 0) {
      console.error('❌ All API calls failed');
      console.error('Failed responses:', responses.filter(r => r.status === 'rejected').map(r => r.reason));
      throw new Error('All API calls failed');
    }
    
    return successfulResponses;
  } catch (error) {
    console.error('💥 Error in parallel API calls:', error);
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

const makeGroqCall = async (apiKey: string, prompt: string, model: string, temperature: number): Promise<string> => {
  console.log('🤖 Making Groq API call...');
  console.log('Groq Request Details:', {
    model,
    temperature,
    promptLength: prompt.length
  });

  const requestBody = {
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model,
    temperature,
    max_completion_tokens: 5201,
    top_p: 1,
    stream: false,
    response_format: {
      type: 'json_object'
    },
    stop: null
  };

  console.log('📤 Groq request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('📥 Groq response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Groq API call failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Groq API call failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('📄 Groq raw response:', JSON.stringify(data, null, 2));
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('❌ Invalid Groq response format:', data);
    throw new Error('Invalid Groq response format');
  }
  
  const content = data.choices[0].message.content;
  console.log('✅ Groq extracted content:', content);
  return content;
};

const makeGeminiCall = async (apiKey: string, prompt: string, temperature: number): Promise<string> => {
  console.log('🧠 Making Gemini API call...');
  console.log('Gemini Request Details:', {
    model: 'gemini-2.5-pro',
    temperature,
    promptLength: prompt.length
  });

  const requestBody = {
    model: 'gemini-2.5-pro',
    config: {
      temperature,
      thinkingConfig: {
        thinkingBudget: -1,
      },
      responseMimeType: 'application/json',
    },
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
  };

  console.log('📤 Gemini request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: requestBody.contents,
      generationConfig: {
        temperature: requestBody.config.temperature,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json'
      },
    }),
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

export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  console.log('🎯 getChatResponseFromGemini called with prompt:', prompt);
  const responses = await makeParallelAPICalls(prompt);
  console.log('🎯 getChatResponseFromGemini returning first response:', responses[0]);
  return responses[0]; // Return the first successful response
};

export const transcribeAudioWithGroq = async (audioBlob: Blob): Promise<string> => {
  console.log('🎤 Starting audio transcription with Groq...');
  const groqApiKey = await getSupabaseSecret('Groq_Api');
  if (!groqApiKey) {
    console.error('❌ Groq API key not found for transcription');
    throw new Error('Groq API key not found in Supabase secrets');
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');

    console.log('📤 Sending transcription request to Groq...');
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    console.log('📥 Transcription response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Transcription failed:', errorText);
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Transcription result:', data);
    return data.text;
  } catch (error) {
    console.error('💥 Error in transcribeAudioWithGroq:', error);
    throw error;
  }
};
