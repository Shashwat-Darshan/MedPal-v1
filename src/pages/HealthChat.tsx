import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Heart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const HealthChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI health assistant. I can help answer general health questions, provide wellness tips, and guide you on when to seek professional medical care. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Predefined responses for common health questions
  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "Headaches can have various causes including stress, dehydration, lack of sleep, or eye strain. For immediate relief, try resting in a dark room, applying a cold compress, staying hydrated, and taking over-the-counter pain relievers as directed. If you experience severe, sudden headaches or headaches with fever, vision changes, or neck stiffness, please seek immediate medical attention.";
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "A fever is usually a sign that your body is fighting an infection. For adults, a fever is generally considered 100.4°F (38°C) or higher. To help manage fever: rest, drink plenty of fluids, take acetaminophen or ibuprofen as directed, and use light clothing. Seek medical care if fever exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms.";
    }
    
    if (lowerMessage.includes('cold') || lowerMessage.includes('runny nose') || lowerMessage.includes('cough')) {
      return "Common cold symptoms typically include runny nose, cough, sneezing, and mild fatigue. To help recovery: get plenty of rest, drink warm fluids, use a humidifier, and consider over-the-counter medications for symptom relief. Most colds resolve within 7-10 days. See a doctor if symptoms worsen or persist beyond 10 days.";
    }
    
    if (lowerMessage.includes('stomach') || lowerMessage.includes('nausea') || lowerMessage.includes('vomiting')) {
      return "Stomach issues can be caused by various factors including food poisoning, stress, or viral infections. For mild symptoms: stay hydrated with clear fluids, try the BRAT diet (bananas, rice, applesauce, toast), and rest. Seek medical attention if you have severe abdominal pain, persistent vomiting, signs of dehydration, or blood in vomit/stool.";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return "Good sleep hygiene is essential for health. Tips for better sleep: maintain a consistent sleep schedule, create a relaxing bedtime routine, avoid screens before bed, keep your bedroom cool and dark, limit caffeine and alcohol, and get regular exercise. Adults should aim for 7-9 hours of sleep per night.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
      return "Regular exercise is crucial for physical and mental health. Adults should aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus muscle-strengthening activities. Start slowly if you're new to exercise, choose activities you enjoy, and always listen to your body. Consult a healthcare provider before starting a new exercise program if you have health concerns.";
    }
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('food')) {
      return "A balanced diet should include plenty of fruits and vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, added sugars, and excessive sodium. Stay hydrated by drinking plenty of water throughout the day. Consider consulting a registered dietitian for personalized nutrition advice.";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health')) {
      return "Managing stress and mental health is important for overall well-being. Strategies include regular exercise, adequate sleep, mindfulness or meditation, deep breathing exercises, connecting with others, and engaging in hobbies. If you're experiencing persistent anxiety, depression, or stress that interferes with daily life, please consider speaking with a mental health professional.";
    }
    
    // Default response
    return "I understand you're asking about health concerns. While I can provide general health information, it's important to remember that I cannot diagnose conditions or replace professional medical advice. For specific symptoms or health concerns, I recommend consulting with a healthcare provider who can properly evaluate your situation and provide personalized care.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How can I improve my sleep quality?",
    "What should I do for a headache?",
    "Tips for staying hydrated",
    "How much exercise do I need?",
    "What are signs of dehydration?",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soothing Live Wallpaper Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent dark:via-white/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-400/10 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-green-200/20 dark:bg-green-400/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 dark:bg-purple-400/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Chat</h1>
                <p className="text-sm text-green-600 dark:text-green-400">Get answers to your health questions</p>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <Alert className="bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 mb-6 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <strong>Important:</strong> This chat provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50">
                <CardHeader className="border-b border-gray-200/50 dark:border-slate-700/50">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="dark:text-white">AI Health Assistant</span>
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex space-x-3 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={message.isBot ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'}>
                              {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`p-3 rounded-lg ${
                            message.isBot 
                              ? 'bg-gray-100/80 text-gray-900 dark:bg-slate-700/80 dark:text-white' 
                              : 'bg-blue-600 text-white dark:bg-blue-500'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex space-x-3 max-w-[80%]">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="p-3 rounded-lg bg-gray-100/80 dark:bg-slate-700/80">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <CardContent className="border-t border-gray-200/50 dark:border-slate-700/50 p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your health question..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1 bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-slate-600/30"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Questions Sidebar */}
            <div className="space-y-6">
              <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 text-sm hover:bg-white/50 dark:hover:bg-slate-700/50 dark:text-gray-200"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Emergency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      If you're experiencing a medical emergency, please call emergency services immediately.
                    </p>
                    <Button variant="destructive" className="w-full">
                      Emergency: 102
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HealthChat;
