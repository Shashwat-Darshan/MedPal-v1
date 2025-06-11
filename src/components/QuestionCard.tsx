
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageSquare, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice';
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isLoading?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isLoading = false }) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      onAnswer(textAnswer.trim());
      setTextAnswer('');
      setShowTextInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <HelpCircle className="h-5 w-5" />
          <span>Follow-up Question</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-blue-800 font-medium">{question.text}</p>
        
        {!showTextInput ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {question.type === 'yes_no' ? (
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => onAnswer('yes')}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Yes
                  </Button>
                  <Button 
                    onClick={() => onAnswer('no')}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => onAnswer(option)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <Button
                onClick={() => setShowTextInput(true)}
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Type your own answer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your detailed answer here..."
              className="min-h-[80px]"
              disabled={isLoading}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim() || isLoading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Answer
              </Button>
              <Button
                onClick={() => setShowTextInput(false)}
                variant="outline"
                disabled={isLoading}
              >
                Back to Options
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-blue-700 text-center">
          This helps improve the accuracy of our suggestions
        </p>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
