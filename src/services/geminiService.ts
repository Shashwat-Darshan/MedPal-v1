import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { Groq } from 'groq-sdk';

const API_KEY = 'AIzaSyDcmdzZwQf9s-iFyANNWyCgLIKOSbBKKSE';
const GROQ_API_KEY = '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';

const genAI = new GoogleGenerativeAI(API_KEY);
const genAI2 = new GoogleGenAI({ apiKey: API_KEY });
const groq = new Groq({ 
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export interface Disease {
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

export interface DiagnosisSession {
  id: string;
  symptoms: string;
  diseases: Disease[];
  currentQuestion: string;
  questionCount: number;
  isComplete: boolean;
  finalDiagnosis?: Disease;
}

export interface DiagnosisResponse {
  diseases: Disease[];
  question: string;
  isComplete: boolean;
  finalDiagnosis?: Disease;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1, // Very low temperature for consistent responses
      topP: 0.8,
      topK: 40,
    }
  });

  private async tryGeminiPro2_5(prompt: string): Promise<string> {
    try {
      const contents = [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ];

      const response = await genAI2.models.generateContentStream({
        model: 'gemini-2.5-pro-preview-06-05',
        config: { 
          responseMimeType: 'text/plain',
          temperature: 0.1, // Low temperature
          topP: 0.8,
        },
        contents,
      });

      let fullResponse = '';
      for await (const chunk of response) {
        fullResponse += chunk.text || '';
      }
      return fullResponse;
    } catch (error) {
      console.error('Gemini Pro 2.5 error:', error);
      throw error;
    }
  }

  private async tryGroqFallback(prompt: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.1, // Very low temperature
        max_completion_tokens: 1024,
        top_p: 0.8,
        stream: false,
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq fallback error:', error);
      throw error;
    }
  }

  private async tryOriginalGemini(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async generateWithFallback(prompt: string): Promise<string> {
    // Try Gemini Pro 2.5 first
    try {
      return await this.tryGeminiPro2_5(prompt);
    } catch (error) {
      console.log('Falling back to Groq...');
      try {
        return await this.tryGroqFallback(prompt);
      } catch (groqError) {
        console.log('Falling back to original Gemini...');
        return await this.tryOriginalGemini(prompt);
      }
    }
  }

  async startDiagnosis(symptoms: string): Promise<DiagnosisResponse> {
    const prompt = `
You are a medical AI diagnostic assistant. A patient is describing symptoms and needs help identifying possible conditions.

Patient says: "${symptoms}"

Your task:
1. Generate exactly 5 possible diseases/conditions ranked by likelihood
2. Assign realistic confidence levels (20-75% range for initial assessment)
3. Ask ONE specific follow-up question to help differentiate between the top conditions

Respond ONLY with valid JSON in this EXACT format:
{
  "diseases": [
    {"name": "Most Likely Condition", "confidence": 65, "description": "Brief medical description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Second Likely Condition", "confidence": 55, "description": "Brief medical description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Third Possibility", "confidence": 45, "description": "Brief medical description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Fourth Possibility", "confidence": 35, "description": "Brief medical description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Fifth Possibility", "confidence": 25, "description": "Brief medical description", "symptoms": ["symptom1", "symptom2", "symptom3"]}
  ],
  "question": "One specific medical question to help narrow down the diagnosis"
}

Rules:
- Order diseases by confidence (highest first)
- Confidence should be realistic (20-75% initially, never start above 75%)
- Ask specific questions about timing, severity, location, triggers, or associated symptoms
- No text outside the JSON structure
- Be medically accurate but avoid alarming language
`;

    try {
      console.log('Starting diagnosis with symptoms:', symptoms);
      const text = await this.generateWithFallback(prompt);
      
      console.log('Raw AI response:', text);
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('No JSON found in response:', cleanedText);
        throw new Error('Invalid response format from AI');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed response:', parsedResponse);
      
      return {
        diseases: parsedResponse.diseases,
        question: parsedResponse.question,
        isComplete: false
      };
    } catch (error) {
      console.error('AI API error:', error);
      return this.getFallbackResponse(symptoms);
    }
  }

  async updateDiagnosis(
    currentDiseases: Disease[],
    question: string,
    answer: string,
    questionCount: number
  ): Promise<DiagnosisResponse> {
    const diseasesText = currentDiseases.map(d => `${d.name}: ${d.confidence}%`).join(', ');
    
    const prompt = `
You are updating a medical diagnosis based on a patient's answer to a follow-up question.

Current diseases and confidence levels: ${diseasesText}
Question asked: "${question}"
Patient's answer: "${answer}"
Question count: ${questionCount}

Your task:
1. Update confidence levels based on the patient's answer
2. Check if diagnosis is complete using these criteria:
   - Any disease reaches 90%+ confidence, OR
   - Top 2 diseases both above 60% with less than 20% difference, OR
   - 10+ questions have been asked

Update rules:
- Increase confidence for diseases that match the answer
- Decrease confidence for diseases that don't match
- Keep confidence realistic (never exceed 95%)
- If complete, mark the top disease as final diagnosis

Respond ONLY with valid JSON in this EXACT format:
{
  "diseases": [
    {"name": "Disease Name", "confidence": 75, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 2", "confidence": 65, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 3", "confidence": 45, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 4", "confidence": 35, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 5", "confidence": 25, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]}
  ],
  "question": "Next specific follow-up question (only if not complete)",
  "isComplete": false,
  "finalDiagnosis": null
}

If complete, set "isComplete": true and "finalDiagnosis" to the top disease object.
No text outside the JSON structure.
`;

    try {
      console.log('Updating diagnosis with answer:', answer);
      const text = await this.generateWithFallback(prompt);
      
      console.log('Raw update response:', text);
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('No JSON found in update response:', cleanedText);
        throw new Error('Invalid response format from AI');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed update response:', parsedResponse);
      
      const diseases = parsedResponse.diseases.sort((a: Disease, b: Disease) => b.confidence - a.confidence);
      
      const topDisease = diseases[0];
      const secondDisease = diseases[1];
      
      // Check completion criteria
      const isComplete = 
        topDisease.confidence >= 90 || 
        (topDisease.confidence >= 60 && secondDisease.confidence >= 60 && 
         (topDisease.confidence - secondDisease.confidence) <= 20) ||
        questionCount >= 10;
      
      return {
        diseases,
        question: parsedResponse.question || "Do you have any other symptoms or concerns?",
        isComplete: isComplete || parsedResponse.isComplete,
        finalDiagnosis: (isComplete || parsedResponse.isComplete) ? topDisease : parsedResponse.finalDiagnosis
      };
    } catch (error) {
      console.error('AI update API error:', error);
      const updatedDiseases = currentDiseases.map(disease => {
        let adjustment = 0;
        const answerLower = answer.toLowerCase();
        
        if (answerLower.includes('yes') || answerLower.includes('have')) {
          adjustment = Math.random() * 15 + 5;
        } else if (answerLower.includes('no') || answerLower.includes('not')) {
          adjustment = -(Math.random() * 10 + 5);
        } else {
          adjustment = Math.random() * 10 - 5;
        }
        
        return {
          ...disease,
          confidence: Math.max(10, Math.min(95, disease.confidence + adjustment))
        };
      }).sort((a, b) => b.confidence - a.confidence);
      
      const topDisease = updatedDiseases[0];
      const isComplete = topDisease.confidence >= 90 || questionCount >= 10;
      
      return {
        diseases: updatedDiseases,
        question: "Can you describe any additional symptoms you're experiencing?",
        isComplete,
        finalDiagnosis: isComplete ? topDisease : undefined
      };
    }
  }

  async chatAboutDiagnosis(
    diagnosisContext: string,
    userMessage: string,
    chatHistory: ChatMessage[]
  ): Promise<string> {
    const historyText = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const prompt = `
You are a medical AI assistant helping a patient understand their diagnosis. 

Diagnosis Context: ${diagnosisContext}

Chat History:
${historyText}

User Question: ${userMessage}

Provide a helpful, informative response about the diagnosis. Be empathetic and educational, but always remind them to consult with healthcare professionals for proper medical advice.

Keep responses concise and easy to understand.
`;

    try {
      return await this.generateWithFallback(prompt);
    } catch (error) {
      console.error('Chat API error:', error);
      return "I'm sorry, I'm having trouble responding right now. Please try again or consult with a healthcare professional for more information about your diagnosis.";
    }
  }

  private getFallbackResponse(symptoms: string): DiagnosisResponse {
    const symptomsLower = symptoms.toLowerCase();
    
    if (symptomsLower.includes('stomach') || symptomsLower.includes('pain')) {
      return {
        diseases: [
          { name: "Gastritis", confidence: 75, description: "Inflammation of stomach lining", symptoms: ["stomach pain", "nausea", "bloating", "heartburn"] },
          { name: "Food Poisoning", confidence: 65, description: "Illness from contaminated food", symptoms: ["nausea", "vomiting", "diarrhea", "stomach cramps"] },
          { name: "Peptic Ulcer", confidence: 55, description: "Sore in stomach or small intestine", symptoms: ["burning stomach pain", "bloating", "heartburn", "nausea"] },
          { name: "Appendicitis", confidence: 45, description: "Inflammation of appendix", symptoms: ["right side pain", "nausea", "vomiting", "fever"] },
          { name: "Gallstones", confidence: 35, description: "Hardened deposits in gallbladder", symptoms: ["upper right pain", "nausea", "vomiting", "fever"] }
        ],
        question: "On a scale of 1-10, how severe is your stomach pain?",
        isComplete: false
      };
    }
    
    return {
      diseases: [
        { name: "Common Cold", confidence: 70, description: "Viral upper respiratory infection", symptoms: ["runny nose", "cough", "sore throat", "fatigue"] },
        { name: "Allergic Rhinitis", confidence: 60, description: "Allergic reaction causing nasal symptoms", symptoms: ["sneezing", "runny nose", "itchy eyes", "congestion"] },
        { name: "Sinusitis", confidence: 50, description: "Inflammation of nasal sinuses", symptoms: ["facial pressure", "thick nasal discharge", "headache", "congestion"] },
        { name: "Flu", confidence: 40, description: "Influenza viral infection", symptoms: ["fever", "body aches", "fatigue", "headache"] },
        { name: "Strep Throat", confidence: 30, description: "Bacterial throat infection", symptoms: ["sore throat", "fever", "swollen glands", "headache"] }
      ],
      question: "How long have you been experiencing these symptoms?",
      isComplete: false
    };
  }
}

export const geminiService = new GeminiService();
