
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const analyzeSymptomsWithGemini = async (symptoms: string, age: string, gender: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON, fallback to structured response
    try {
      return JSON.parse(text);
    } catch {
      return {
        diagnosis: "Unable to determine specific diagnosis",
        confidence: 50,
        possibleCauses: ["Multiple factors possible"],
        recommendations: ["Consult healthcare provider"],
        warningSigns: ["Worsening symptoms"]
      };
    }
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error('Failed to analyze symptoms');
  }
};

export const getChatResponseFromGemini = async (message: string, context?: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    You are a helpful medical AI assistant. Provide informative and supportive responses about health topics.
    ${context ? `Context: ${context}` : ''}
    
    User message: ${message}
    
    Please provide a helpful, accurate response while reminding users to consult healthcare professionals for serious concerns.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get response');
  }
};
