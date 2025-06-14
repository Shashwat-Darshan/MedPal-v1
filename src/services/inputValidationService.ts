
export interface InputClassification {
  type: 'symptoms' | 'assumption' | 'casual' | 'invalid' | 'harmful';
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export interface ValidationResult {
  isValid: boolean;
  classification: InputClassification;
  sanitizedInput: string;
  requiresGuidance: boolean;
}

// Phase 1: Input Validation & Sanitization
export const sanitizeInput = (input: string): string => {
  // Remove potential code injection patterns
  const sanitized = input
    .replace(/[<>{}]/g, '') // Remove HTML/JS brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/onload|onerror|onclick/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
};

export const validateInputLength = (input: string): boolean => {
  return input.length >= 10 && input.length <= 2000;
};

export const containsMedicalContext = (input: string): boolean => {
  const medicalKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'fever', 'temperature', 'nausea', 'dizzy', 'tired',
    'fatigue', 'headache', 'cough', 'sneeze', 'congestion', 'swelling', 'rash', 'itch',
    'bleeding', 'bruise', 'difficulty', 'trouble', 'breathing', 'swallowing', 'sleeping',
    'appetite', 'weight', 'vision', 'hearing', 'numbness', 'tingling', 'weakness',
    'chest', 'stomach', 'abdomen', 'back', 'neck', 'shoulder', 'knee', 'ankle',
    'symptoms', 'feeling', 'experiencing', 'noticed', 'started', 'began', 'worse', 'better'
  ];
  
  const lowerInput = input.toLowerCase();
  return medicalKeywords.some(keyword => lowerInput.includes(keyword));
};

// Phase 2: Smart Input Classification
export const classifyInput = (input: string): InputClassification => {
  const lowerInput = input.toLowerCase();
  
  // Check for casual conversation
  const casualPatterns = [
    /\b(hey|hi|hello|how are you|what's up|baby|babe)\b/i,
    /\b(thanks|thank you|bye|goodbye|see you)\b/i,
    /\b(lol|haha|omg|wtf)\b/i
  ];
  
  if (casualPatterns.some(pattern => pattern.test(input))) {
    return {
      type: 'casual',
      confidence: 0.9,
      issues: ['Non-medical conversation detected'],
      suggestions: ['Please describe your symptoms or health concerns instead']
    };
  }
  
  // Check for harmful/inappropriate content
  const harmfulPatterns = [
    /\b(kill|die|suicide|self-harm|illegal|drug abuse)\b/i,
    /\b(hack|inject|script|execute|eval)\b/i
  ];
  
  if (harmfulPatterns.some(pattern => pattern.test(input))) {
    return {
      type: 'harmful',
      confidence: 0.95,
      issues: ['Inappropriate or harmful content detected'],
      suggestions: ['Please focus on describing medical symptoms only']
    };
  }
  
  // Check for medical assumptions vs symptoms
  const assumptionPatterns = [
    /\b(I have|I think I have|I probably have|I might have)\s+[a-z\s]+(cancer|disease|syndrome|disorder|condition)\b/i,
    /\b(diagnosed with|suffering from|afflicted with)\b/i,
    /\b(it's probably|it must be|I'm sure it's)\b/i
  ];
  
  if (assumptionPatterns.some(pattern => pattern.test(input))) {
    return {
      type: 'assumption',
      confidence: 0.8,
      issues: ['Medical assumption detected instead of symptoms'],
      suggestions: [
        'Instead of stating what you think you have, please describe what you feel or observe',
        'Focus on physical sensations, when they started, and how they affect you'
      ]
    };
  }
  
  // Check for actual symptoms
  if (containsMedicalContext(input)) {
    const symptomIndicators = [
      /\b(feel|feeling|experiencing|having|noticed|started|began)\b/i,
      /\b(pain|ache|hurt|uncomfortable|difficult|trouble)\b/i,
      /\b(since|for the past|yesterday|today|this morning|last week)\b/i
    ];
    
    if (symptomIndicators.some(pattern => pattern.test(input))) {
      return {
        type: 'symptoms',
        confidence: 0.9,
        issues: [],
        suggestions: []
      };
    }
  }
  
  return {
    type: 'invalid',
    confidence: 0.7,
    issues: ['Input does not appear to contain clear medical symptoms'],
    suggestions: [
      'Please describe specific symptoms you are experiencing',
      'Include when symptoms started and how severe they are',
      'Focus on what you feel rather than what you think you have'
    ]
  };
};

// Main validation function
export const validateInput = (input: string): ValidationResult => {
  const sanitizedInput = sanitizeInput(input);
  
  if (!validateInputLength(sanitizedInput)) {
    return {
      isValid: false,
      classification: {
        type: 'invalid',
        confidence: 1.0,
        issues: ['Input is too short or too long'],
        suggestions: ['Please provide a detailed description of your symptoms (10-2000 characters)']
      },
      sanitizedInput,
      requiresGuidance: true
    };
  }
  
  const classification = classifyInput(sanitizedInput);
  
  return {
    isValid: classification.type === 'symptoms',
    classification,
    sanitizedInput,
    requiresGuidance: classification.type !== 'symptoms'
  };
};
