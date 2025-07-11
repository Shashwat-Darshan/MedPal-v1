import { getChatResponseFromGemini } from './apiService';

export interface Disease {
  id: string;
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

// Export the function from apiService for backward compatibility
export { getChatResponseFromGemini };

const extractJsonFromResponse = (response: string): any => {
  console.log('🔍 Extracting JSON from response:', response);
  
  // Try to find JSON in the response
  const jsonMatch = response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    console.log('📋 Found JSON match:', jsonMatch[0]);
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed JSON:', parsed);
      return parsed;
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      console.error('Raw JSON string:', jsonMatch[0]);
    }
  } else {
    console.warn('⚠️ No JSON pattern found in response');
  }
  return null;
};

export const generateDiagnosisFromSymptoms = async (symptoms: string): Promise<Disease[]> => {
  console.log('🏥 ========== DIAGNOSIS GENERATION START ==========');
  console.log('📝 Input symptoms:', symptoms);

  const prompt = `You are an experienced medical AI assistant. Analyze these symptoms: "${symptoms}"

Based on the symptoms, provide a differential diagnosis with exactly 5 possible conditions. Consider the most likely medical explanations for the given symptoms.

Return your analysis in this exact JSON format:
[
  {
    "name": "Most Likely Condition Name",
    "confidence": 65,
    "description": "Clear medical explanation of why this condition fits the symptoms",
    "symptoms": ["key symptom 1", "key symptom 2", "key symptom 3"]
  },
  {
    "name": "Second Possibility",
    "confidence": 45,
    "description": "Medical reasoning for this condition",
    "symptoms": ["relevant symptom 1", "relevant symptom 2"]
  }
]

Guidelines:
- Order by likelihood (highest confidence first)
- Confidence scores should reflect realistic medical assessment (most conditions 30-70%, rarely above 80% without tests)
- Include common conditions before rare ones
- Descriptions should explain the medical connection to symptoms
- Use proper medical terminology but keep explanations clear
- Consider age-appropriate conditions (assume adult if not specified)`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    console.log('📄 Raw diagnosis response:', response);

    const parsed = extractJsonFromResponse(response);
    if (parsed && Array.isArray(parsed)) {
      const formattedDiseases = parsed.map((disease: any, index: number) => ({
        id: `condition_${index + 1}`,
        name: disease.name || `Condition ${index + 1}`,
        confidence: Math.min(85, Math.max(15, disease.confidence || 30)),
        description: disease.description || 'Medical condition requiring further evaluation',
        symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [symptoms]
      }));
      
      console.log('✅ Generated diagnoses:', formattedDiseases);
      return formattedDiseases;
    }
    
    return generateFallbackDiagnosis(symptoms);
  } catch (error) {
    console.error('💥 Error generating diagnosis:', error);
    return generateFallbackDiagnosis(symptoms);
  }
};

const generateFallbackDiagnosis = (symptoms: string): Disease[] => {
  console.log('🔄 Generating fallback diagnosis for symptoms:', symptoms);
  return [
    {
      id: 'disease_1',
      name: 'General Health Concern',
      confidence: 50,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_2',
      name: 'Stress-Related Condition',
      confidence: 35,
      description: 'Symptoms may be related to stress or lifestyle factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_3',
      name: 'Minor Infection',
      confidence: 30,
      description: 'Could be related to a minor viral or bacterial infection.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_4',
      name: 'Allergic Reaction',
      confidence: 25,
      description: 'May be an allergic response to environmental factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_5',
      name: 'Fatigue Syndrome',
      confidence: 20,
      description: 'Could be related to fatigue or sleep-related issues.',
      symptoms: [symptoms]
    }
  ];
};

export const generateFollowUpQuestion = async (
  diseases: Disease[],
  symptoms: string,
  questionHistory: string[],
  answerHistory: string[],
  previousQuestion: string = ''
): Promise<{ question: string; diseaseImpacts: Record<string, number> }> => {
  console.log('❓ ========== GENERATING INTELLIGENT FOLLOW-UP ==========');
  
  const topDiseases = diseases
    .filter(d => d.confidence > 10)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (topDiseases.length < 2) {
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }

  const conversationContext = questionHistory.length > 0 
    ? `\nPrevious questions asked: ${questionHistory.join(', ')}\nPrevious answers: ${answerHistory.join(', ')}`
    : '';

  const prompt = `You are an experienced physician conducting a diagnostic interview. 

Current Case:
- Patient's symptoms: "${symptoms}"
- Top differential diagnoses: 
  1. ${topDiseases[0].name} (${topDiseases[0].confidence}% confidence)
  2. ${topDiseases[1].name} (${topDiseases[1].confidence}% confidence)
  ${topDiseases[2] ? `3. ${topDiseases[2].name} (${topDiseases[2].confidence}% confidence)` : ''}
${conversationContext}

Generate ONE highly specific follow-up question that will help distinguish between these conditions. The question should target key differentiating factors.

Examples of good questions:
- "Have you noticed any changes in your vision or sensitivity to light?"
- "Does the pain worsen when you move your neck or turn your head?"
- "Have you had any recent travel or exposure to sick individuals?"
- "Do you experience symptoms more at certain times of day?"

Return ONLY this JSON format:
{
  "question": "Your targeted diagnostic question?",
  "diseaseImpacts": {
    "${topDiseases[0].name}": 10,
    "${topDiseases[1].name}": -8,
    "${topDiseases[2]?.name || 'Other'}": 5
  }
}

The question should be:
- Medically relevant and specific
- Directly helpful for differential diagnosis
- Not already covered in previous questions
- Clear and easy to understand`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    const parsed = extractJsonFromResponse(response);
    
    if (parsed?.question && parsed?.diseaseImpacts) {
      console.log('✅ Generated targeted question:', parsed.question);
      return {
        question: parsed.question,
        diseaseImpacts: parsed.diseaseImpacts
      };
    }
    
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }
};

const generateTargetedFallback = (
  diseases: Disease[], 
  symptoms: string, 
  questionHistory: string[]
): { question: string; diseaseImpacts: Record<string, number> } => {
  console.log('🎯 Generating targeted fallback question');
  
  // Medical question banks based on common symptom patterns
  const medicalQuestions = [
    {
      question: "Have you noticed any specific triggers that make your symptoms worse or better?",
      category: "triggers",
      impacts: [8, -4, 6]
    },
    {
      question: "Are your symptoms constant throughout the day, or do they come and go?",
      category: "pattern",
      impacts: [10, -6, 8]
    },
    {
      question: "Have you experienced any fever, night sweats, or unexplained weight changes recently?",
      category: "systemic",
      impacts: [12, -8, 4]
    },
    {
      question: "Do you have any family history of similar health conditions?",
      category: "family_history",
      impacts: [6, 8, -4]
    },
    {
      question: "Have you traveled anywhere recently or been exposed to anyone who was sick?",
      category: "exposure",
      impacts: [15, -5, 10]
    },
    {
      question: "Are you currently taking any medications, supplements, or have any known allergies?",
      category: "medications",
      impacts: [-2, 12, -6]
    },
    {
      question: "How would you describe your sleep pattern and stress levels lately?",
      category: "lifestyle",
      impacts: [4, -8, 12]
    },
    {
      question: "Have you noticed any changes in your appetite, energy level, or mood?",
      category: "general_health",
      impacts: [6, 5, -10]
    }
  ];

  // Filter out questions we've already asked
  const usedCategories: string[] = questionHistory.map(q => {
    if (q.includes('trigger')) return 'triggers';
    if (q.includes('constant') || q.includes('come and go')) return 'pattern';
    if (q.includes('fever') || q.includes('weight')) return 'systemic';
    if (q.includes('family')) return 'family_history';
    if (q.includes('travel') || q.includes('exposed')) return 'exposure';
    if (q.includes('medication') || q.includes('allergies')) return 'medications';
    if (q.includes('sleep') || q.includes('stress')) return 'lifestyle';
    if (q.includes('appetite') || q.includes('energy')) return 'general_health';
    return '';
  }).filter(cat => cat !== '');

  const availableQuestions = medicalQuestions.filter(q => !usedCategories.includes(q.category));
  const selectedQuestion = availableQuestions.length > 0 
    ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    : medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];

  const diseaseImpacts: Record<string, number> = {};
  const topDiseases = diseases.slice(0, 3);
  
  topDiseases.forEach((disease, index) => {
    diseaseImpacts[disease.name] = selectedQuestion.impacts[index] || 0;
  });

  console.log('🎯 Selected targeted question:', selectedQuestion.question);
  return {
    question: selectedQuestion.question,
    diseaseImpacts
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const history = chatHistory
    .slice(-6) // Keep last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful AI health assistant. Respond naturally in plain text without any JSON formatting.

Context: ${diagnosisContext}

Recent conversation:
${history}

User question: ${userMessage}

Provide a concise, helpful, and supportive response in plain conversational text. Always recommend consulting healthcare professionals for medical advice.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    // Ensure we return clean text, not JSON
    if (response.includes('"response":') || response.includes('{') || response.includes('}')) {
      try {
        const parsed = JSON.parse(response);
        return parsed.response || parsed.content || response;
      } catch {
        return response.replace(/[{}"\[\]]/g, '').replace(/response:|content:/g, '').trim();
      }
    }
    return response;
  } catch (error) {
    console.error('Error in chat about diagnosis:', error);
    return 'I apologize, but I encountered an error. Please try rephrasing your question, or consider consulting with a healthcare professional for personalized medical advice.';
  }
};

// Export geminiService object for backward compatibility
export const geminiService = {
  chatAboutDiagnosis,
  generateDiagnosisFromSymptoms,
  generateFollowUpQuestion
};
