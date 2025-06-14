
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey.trim());
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved successfully",
    });
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed",
    });
  };

  const hasLocalKey = localStorage.getItem('gemini_api_key');
  const hasBuiltinKeys = true; // We have fallback keys

  return (
    <Card className="glass-light dark:glass-card dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          <Key className="h-5 w-5 text-blue-600" />
          <span>Gemini API Key</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Fallback system active with {hasBuiltinKeys ? '3' : '0'} backup keys
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm mt-1">
            {hasLocalKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Custom API key configured</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">Using built-in fallback keys</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-gray-700 dark:text-gray-300">
            Enter your Gemini API Key (Optional)
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? "text" : "password"}
              placeholder="Enter your API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="glass-light-subtle dark:bg-gray-800 dark:border-gray-600 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Your API key is stored locally and takes priority over built-in keys.</p>
          <p>The system will automatically try fallback keys if your key fails.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
