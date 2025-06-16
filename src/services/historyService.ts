export interface DiagnosticSession {
  id: string;
  timestamp: string;
  symptoms: string;
  diseases: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  questionAnswerPairs: Array<{
    question: string;
    answer: string;
    timestamp: string;
  }>;
  finalResults?: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  completedAt?: string;
  inputValidation?: {
    originalInput: string;
    sanitizedInput: string;
    classification: string;
    issues: string[];
  };
}

export const saveSession = (sessionData: Partial<DiagnosticSession>): string => {
  try {
    const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const session: DiagnosticSession = {
      id: sessionId,
      timestamp,
      symptoms: '',
      diseases: [],
      questionAnswerPairs: [],
      ...sessionData
    };
    
    // Save to localStorage
    const existingSessions = getSessionHistory();
    const updatedSessions = [session, ...existingSessions.filter(s => s.id !== sessionId)];
    
    // Keep only last 50 sessions
    const limitedSessions = updatedSessions.slice(0, 50);
    
    localStorage.setItem('diagnosticHistory', JSON.stringify(limitedSessions));
    console.log('Session saved:', sessionId);
    
    return sessionId;
  } catch (error) {
    console.error('Error saving session:', error);
    return '';
  }
};

export const getSessionHistory = (): DiagnosticSession[] => {
  try {
    const history = localStorage.getItem('diagnosticHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
};

export const getSession = (sessionId: string): DiagnosticSession | null => {
  try {
    const sessions = getSessionHistory();
    return sessions.find(s => s.id === sessionId) || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const updateSession = (sessionId: string, updates: Partial<DiagnosticSession>): void => {
  try {
    const sessions = getSessionHistory();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
      localStorage.setItem('diagnosticHistory', JSON.stringify(sessions));
      console.log('Session updated:', sessionId);
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem('diagnosticHistory');
    console.log('Diagnostic history cleared');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};
