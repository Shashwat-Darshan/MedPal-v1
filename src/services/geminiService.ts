
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDcmdzZwQf9s-iFyANNWyCgLIKOSbBKKSE';
const genAI = new GoogleGenerativeAI(API_KEY);

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

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async startDiagnosis(symptoms: string): Promise<DiagnosisResponse> {
    const prompt = `
As a medical AI assistant, analyze these symptoms and provide exactly 5 possible diseases with confidence levels:
Symptoms: "${symptoms}"

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "diseases": [
    {"name": "Disease Name", "confidence": 75, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 2", "confidence": 65, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 3", "confidence": 55, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 4", "confidence": 45, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 5", "confidence": 35, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]}
  ],
  "question": "A specific follow-up question to help narrow down the diagnosis"
}

Rules:
- Confidence levels should be realistic (30-80% range initially)
- Order diseases by confidence (highest first)
- Ask ONE specific question that would help differentiate between the top conditions
- Include 3-4 common symptoms for each disease
- No additional text outside the JSON
`;

    try {
      console.log('Starting diagnosis with symptoms:', symptoms);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Raw Gemini response:', text);
      
      // Clean the response to extract JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('No JSON found in response:', cleanedText);
        throw new Error('Invalid response format from Gemini');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed response:', parsedResponse);
      
      return {
        diseases: parsedResponse.diseases,
        question: parsedResponse.question,
        isComplete: false
      };
    } catch (error) {
      console.error('Gemini API error:', error);
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
Based on the patient's answer, update the confidence levels for these diseases and determine if diagnosis is complete:

Current diseases: ${diseasesText}
Question asked: "${question}"
Patient's answer: "${answer}"

Update confidence levels based on the answer. Check completion criteria:
- Any disease above 90% confidence, OR
- Top 2 diseases have less than 20% difference AND both are above 60% confidence

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "diseases": [
    {"name": "Disease Name", "confidence": 85, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 2", "confidence": 70, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 3", "confidence": 45, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 4", "confidence": 35, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]},
    {"name": "Disease Name 5", "confidence": 25, "description": "Brief description", "symptoms": ["symptom1", "symptom2", "symptom3"]}
  ],
  "question": "Next follow-up question (if needed)",
  "isComplete": true,
  "finalDiagnosis": {"name": "Most Likely Disease", "confidence": 90, "description": "Description", "symptoms": ["symptom1", "symptom2", "symptom3"]}
}

Order by confidence and ask relevant follow-up questions if not complete. No additional text outside the JSON.
`;

    try {
      console.log('Updating diagnosis with answer:', answer);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Raw update response:', text);
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('No JSON found in update response:', cleanedText);
        throw new Error('Invalid response format from Gemini');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed update response:', parsedResponse);
      
      const diseases = parsedResponse.diseases.sort((a: Disease, b: Disease) => b.confidence - a.confidence);
      
      const topDisease = diseases[0];
      const secondDisease = diseases[1];
      
      const isComplete = 
        topDisease.confidence >= 90 || 
        (topDisease.confidence >= 60 && secondDisease.confidence >= 60 && 
         (topDisease.confidence - secondDisease.confidence) <= 20) ||
        questionCount >= 10;
      
      return {
        diseases,
        question: parsedResponse.question || "Do you have any other symptoms or concerns?",
        isComplete,
        finalDiagnosis: isComplete ? topDisease : parsedResponse.finalDiagnosis
      };
    } catch (error) {
      console.error('Gemini update API error:', error);
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
