
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
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }),
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      })
    ];

    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    const validResponses = results
      .filter(result => result.choices && result.choices[0])
      .map(result => result.choices[0].message.content);

    console.log('Received', validResponses.length, 'successful responses');
    return validResponses;
  } catch (error) {
    console.error('Error in parallel API calls:', error);
    throw error;
  }
};

export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  const groqApiKey = localStorage.getItem('groq_api_key');
  if (!groqApiKey) {
    throw new Error('Groq API key not found');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Critical thinking synthesis completed');
    
    return data.choices[0].message.content;
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
