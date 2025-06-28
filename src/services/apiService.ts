
// API service for making calls to various AI services
export const makeParallelAPICalls = async (prompt: string): Promise<string[]> => {
  console.log('Starting parallel API calls with correct models...');
  
  const groqApiKey = localStorage.getItem('groq_api_key');
  if (!groqApiKey) {
    throw new Error('Groq API key not found');
  }

  console.log('Attempting Groq API call with key:', groqApiKey.substring(0, 8) + '...');

  try {
    // Make two parallel calls to Groq for better results
    const promises = [
      makeGroqCall(groqApiKey, prompt, 'llama-3.1-70b-versatile', 0.7),
      makeGroqCall(groqApiKey, prompt, 'llama-3.1-8b-instant', 0.8)
    ];

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
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format');
  }
  
  return data.choices[0].message.content;
};

export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  const groqApiKey = localStorage.getItem('groq_api_key');
  if (!groqApiKey) {
    throw new Error('Groq API key not found');
  }

  try {
    const response = await makeGroqCall(groqApiKey, prompt, 'llama-3.1-70b-versatile', 0.7);
    console.log('Critical thinking synthesis completed');
    return response;
  } catch (error) {
    console.error('Error in getChatResponseFromGemini:', error);
    throw error;
  }
};

export const transcribeAudioWithGroq = async (audioBlob: Blob): Promise<string> => {
  const groqApiKey = localStorage.getItem('groq_api_key');
  if (!groqApiKey) {
    throw new Error('Groq API key not found');
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
