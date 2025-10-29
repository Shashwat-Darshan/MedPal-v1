import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple toast notification function 
const showToast = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
  `;
  
  switch (type) {
    case 'warning':
      toast.style.backgroundColor = '#f59e0b';
      break;
    case 'error':
      toast.style.backgroundColor = '#ef4444';
      break;
    default:
      toast.style.backgroundColor = '#3b82f6';
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 5000);
};

// API Provider Configuration
interface ApiProvider {
  name: string;
  priority: number;
  getApiKey: () => string | null;
  makeRequest: (prompt: string, temperature: number) => Promise<string>;
  isRateLimited: (error: any) => boolean;
}

// Gemini API Provider
const geminiProvider: ApiProvider = {
  name: 'Gemini',
  priority: 1,
  getApiKey: () => {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
    return import.meta.env.VITE_GEMINI_API_KEY || null;
  },
  makeRequest: async (prompt: string, temperature: number) => {
    const startTime = Date.now();
    const apiKey = geminiProvider.getApiKey();
    if (!apiKey) {
      console.error('🔑 Gemini API key not found');
      console.log('🔍 Checking sources:');
      console.log('- localStorage gemini_api_key:', !!localStorage.getItem('gemini_api_key'));
      console.log('- VITE_GEMINI_API_KEY:', !!import.meta.env.VITE_GEMINI_API_KEY);
      console.log('- GEMINI_API_KEY:', !!import.meta.env.GEMINI_API_KEY);
      console.log('- VITE_GOOGLE_API_KEY:', !!import.meta.env.VITE_GOOGLE_API_KEY);
      throw new Error('Gemini API key not found. Please check Settings or environment variables.');
    }

    console.log('🔑 Using Gemini API key:', apiKey.substring(0, 10) + '...');

    console.log('📤 Setting up Gemini client...');
    
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    try {
      console.log('📤 Sending request to Gemini API...');
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3,
          topP: 0.8,
          topK: 20
        },
      });

      clearTimeout(timeoutId);

      console.log('📥 Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        
        // Parse error details for better debugging
        let errorDetails = '';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorDetails = `\nError Code: ${errorJson.error.code}\nError Message: ${errorJson.error.message}\nStatus: ${errorJson.error.status}`;
            
            // Check for specific quota violations
            if (errorJson.error.details) {
              const quotaViolations = errorJson.error.details
                .filter((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure')
                .flatMap((detail: any) => detail.violations || []);
              
              if (quotaViolations.length > 0) {
                errorDetails += '\n\nQuota Violations:';
                quotaViolations.forEach((violation: any) => {
                  errorDetails += `\n- ${violation.quotaId}: ${violation.quotaMetric}`;
                });
              }
            
              // Check for retry info
              const retryInfo = errorJson.error.details
                .find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
              if (retryInfo) {
                errorDetails += `\n\nRetry After: ${retryInfo.retryDelay}`;
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error JSON:', parseError);
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}${errorDetails}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let responseText;
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        // New format
        responseText = data.candidates[0].content.parts[0].text;
      } else if (data.candidates?.[0]?.text) {
        // Older format
        responseText = data.candidates[0].text;
      } else {
        console.error('❌ Invalid Gemini response format:', data);
        throw new Error('Invalid Gemini response format - no text content found');
      }

      // Log the response format for debugging
      console.log('📄 Response format:', {
        hasNewFormat: !!data.candidates?.[0]?.content?.parts?.[0]?.text,
        hasOldFormat: !!data.candidates?.[0]?.text
      });
      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini Response (${responseTime}ms):`, responseText);
      
      // Track performance
      try {
        const { addPerformanceMetric } = await import('@/components/PerformanceMonitor');
        addPerformanceMetric('Gemini', responseTime, true);
      } catch (error) {
        // Silently fail if performance monitor not available
      }
      
      return responseText;
    } catch (fetchError) {
      const responseTime = Date.now() - startTime;
      console.error(`🌐 Gemini API error (${responseTime}ms):`, fetchError);
      
      // Track performance failure
      try {
        const { addPerformanceMetric } = await import('@/components/PerformanceMonitor');
        addPerformanceMetric('Gemini', responseTime, false);
      } catch (error) {
        // Silently fail if performance monitor not available
      }
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: Gemini API took too long to respond. Try again or use a different provider.');
      }
      
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Gemini API. Check your internet connection.');
      }
      
      throw fetchError;
    }
  },
  isRateLimited: (error) => {
    const isRateLimit = error.message.includes('429') || 
                       error.message.includes('Rate limit') ||
                       error.message.includes('RESOURCE_EXHAUSTED') ||
                       error.message.includes('quota') ||
                       error.message.includes('QuotaFailure');
    
    if (isRateLimit) {
      console.log('🚫 Rate limit detected for Gemini API');
      // Extract retry delay if available
      const retryMatch = error.message.match(/Retry After: ([^\n]+)/);
      if (retryMatch) {
        console.log(`⏰ Retry after: ${retryMatch[1]}`);
      }
    }
    
    return isRateLimit;
  }
};

// Groq API Provider
const groqProvider: ApiProvider = {
  name: 'Groq',
  priority: 2,
  getApiKey: () => {
    const localKey = localStorage.getItem('groq_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
    return import.meta.env.VITE_GROQ_API_KEY || null;
  },
  makeRequest: async (prompt: string, temperature: number) => {
    const apiKey = groqProvider.getApiKey();
    if (!apiKey) throw new Error('Groq API key not found');

    const requestBody = {
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: 1500,
      top_p: 0.8,
      stream: false
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid Groq response format');
    }

    return data.choices[0].message.content;
  },
  isRateLimited: (error) => error.message.includes('429') || error.message.includes('rate limit')
};

// Mistral API Provider
const mistralProvider: ApiProvider = {
  name: 'Mistral',
  priority: 3,
  getApiKey: () => {
    const localKey = localStorage.getItem('mistral_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
    return import.meta.env.VITE_MISTRAL_API_KEY || null;
  },
  makeRequest: async (prompt: string, temperature: number) => {
    const apiKey = mistralProvider.getApiKey();
    if (!apiKey) throw new Error('Mistral API key not found');

    const requestBody = {
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: 1500,
      top_p: 0.8,
      stream: false
    };

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid Mistral response format');
    }

    return data.choices[0].message.content;
  },
  isRateLimited: (error) => error.message.includes('429') || error.message.includes('rate limit')
};

// Fast mode configuration - bypasses multi-provider logic for maximum speed
let fastMode = false;

export const setFastMode = (enabled: boolean) => {
  fastMode = enabled;
  console.log(`🚀 Fast mode ${enabled ? 'enabled' : 'disabled'}`);
};

// Fast single-provider API call (like Python script)
const fastGeminiCall = async (prompt: string): Promise<string> => {
  const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not found');

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 800, // Reduced for speed
      temperature: 0.2, // Lower for faster generation
      topK: 10 // Minimal for speed
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Multi-provider API service
export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
  // Fast mode: direct Gemini call (like Python script)
  if (fastMode) {
    try {
      return await fastGeminiCall(prompt);
    } catch (error) {
      console.error('Fast mode failed, falling back to multi-provider:', error);
      // Fall back to multi-provider if fast mode fails
    }
  }

  const providers: ApiProvider[] = [geminiProvider, groqProvider, mistralProvider];
  const availableProviders = providers.filter(p => p.getApiKey());
  
  if (availableProviders.length === 0) {
    throw new Error('No API keys found. Please configure at least one API key in settings.');
  }

  // Only log in non-fast mode
  if (!fastMode) {
    console.log(`🔑 Using ${availableProviders.length} providers:`, availableProviders.map(p => p.name));
    
    // Warn user if only one provider is configured
    if (availableProviders.length === 1) {
      console.log('⚠️ Only one API provider configured. Consider adding alternative providers for better reliability.');
      showToast('Only one API provider configured. Add Groq or Mistral API keys in Settings for automatic failover.', 'warning');
    }
  }

  let lastError: Error | null = null;
  let switchedProvider = false;

  for (const provider of availableProviders) {
    try {
      const response = await provider.makeRequest(prompt, 0.35);
      
      if (switchedProvider && !fastMode) {
        showToast(`Switched to ${provider.name} API successfully!`, 'info');
      }
      
      return response;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Check if it's a rate limit error
      if (provider.isRateLimited(lastError)) {
        if (!fastMode) {
          console.log(`⏳ ${provider.name} rate limited, switching...`);
          showToast(`${provider.name} rate limited, switching to next provider...`, 'warning');
        }
        switchedProvider = true;
        continue;
      }
      
      // For non-rate-limit errors, try the next provider anyway
      continue;
    }
  }
  
  // If all providers failed
  console.error('💥 All API providers failed');
  throw lastError || new Error('All API providers failed');
};

// Legacy function for backward compatibility
const getApiKey = (): string | null => {
  console.log('🔍 Searching for API key...');
  
  // First try to get from localStorage
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey && localKey.trim()) {
    console.log('📦 Found API key in localStorage');
    return localKey.trim();
  }
  
  // Check for environment variables
  console.log('🌍 Checking environment variables...');
  console.log('Available env vars:', Object.keys(import.meta.env));
  
  // Try different possible environment variable names
  const possibleKeys = [
    'VITE_GEMINI_API_KEY',
    'GEMINI_API_KEY',
    'VITE_GOOGLE_API_KEY',
    'GOOGLE_API_KEY'
  ];
  
  for (const key of possibleKeys) {
    const value = import.meta.env[key];
    if (value) {
      console.log(`✅ Found API key in environment variable: ${key}`);
      return value;
    }
  }
  
  console.log('❌ No API key found in environment variables');
  return null;
};

// Export provider information for the UI
export const getAvailableProviders = () => {
  const providers = [geminiProvider, groqProvider, mistralProvider];
  return providers.map(provider => ({
    name: provider.name,
    hasKey: !!provider.getApiKey(),
    priority: provider.priority
  }));
};

// Export individual provider functions for testing
export const testGeminiConnection = () => geminiProvider.makeRequest('Hello', 0.1);
export const testGroqConnection = () => groqProvider.makeRequest('Hello', 0.1);
export const testMistralConnection = () => mistralProvider.makeRequest('Hello', 0.1);

export { geminiProvider, groqProvider, mistralProvider };