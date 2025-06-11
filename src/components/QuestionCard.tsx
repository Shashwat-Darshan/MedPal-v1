
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice';
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <HelpCircle className="h-5 w-5" />
          <span>Additional Question</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-blue-800 font-medium">{question.text}</p>
        
        <div className="space-y-2">
          {question.type === 'yes_no' ? (
            <div className="flex space-x-3">
              <Button 
                onClick={() => onAnswer('yes')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Yes
              </Button>
              <Button 
                onClick={() => onAnswer('no')}
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
                  variant="outline"
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-blue-700 text-center">
          This helps improve the accuracy of our suggestions
        </p>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
