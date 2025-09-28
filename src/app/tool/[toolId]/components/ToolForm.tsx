"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tool } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

// --- 型定義の強化 ---
interface InputSchemaProperty {
  type: 'string' | 'select' | 'textarea';
  description: string;
  enum?: string[];
}

interface InputSchema {
  type: 'object';
  properties: Record<string, InputSchemaProperty>;
  required?: string[];
}

interface ToolFormProps {
  tool: Tool;
}

export const ToolForm = ({ tool }: ToolFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [modelProvider, setModelProvider] = useState('openai');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInputSchema = useCallback((): InputSchema | null => {
    try {
      if (typeof tool.inputSchema === 'string') {
        return JSON.parse(tool.inputSchema);
      }
      return tool.inputSchema as InputSchema;
    } catch {
      return null;
    }
  }, [tool.inputSchema]);

  useEffect(() => {
    const schema = getInputSchema();
    const defaultFormData: Record<string, string> = {};
    if (schema && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (value.type === 'select' && value.enum && value.enum.length > 0) {
          defaultFormData[key] = value.enum[0];
        } else {
          defaultFormData[key] = '';
        }
      }
    }
    setFormData(defaultFormData);
  }, [tool.id, getInputSchema]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (key: string, value: string) => {
    if (value) setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id, inputData: formData, modelProvider }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テキストの生成に失敗しました。');
      }
      const data = await response.json();
      setGeneratedText(data.outputText);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const schema = getInputSchema();
  if (!schema || !schema.properties) {
    return <p className="text-destructive">フォームの定義(inputSchema)が不正です。</p>;
  }

  const cardBaseClass = "bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl border";

  const renderFormField = (key: string, value: InputSchemaProperty) => {
    if (value.type === 'select' && Array.isArray(value.enum)) {
      return (
        <ToggleGroup type="single" value={formData[key]} onValueChange={(val) => handleToggleChange(key, val)} className="flex-wrap justify-start gap-2">
          {value.enum.map((option: string) => (
            <ToggleGroupItem key={option} value={option} className="rounded-full data-[state=on]:bg-pink-400 data-[state=on]:text-white hover:bg-pink-100 transition-colors duration-200">
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    }

    if (value.type === 'textarea') {
      return (
        <Textarea
          id={key}
          name={key}
          value={formData[key] || ''}
          onChange={handleInputChange}
          required={schema.required?.includes(key)}
          placeholder={`${value.description}を詳しく入力...`}
          className="bg-white/50"
          rows={5}
        />
      );
    }

    return (
      <Input
        id={key}
        name={key}
        value={formData[key] || ''}
        onChange={handleInputChange}
        required={schema.required?.includes(key)}
        placeholder={`${value.description}を入力...`}
        className="bg-white/50"
      />
    );
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cardBaseClass}>
        <CardHeader><CardTitle className="text-slate-700">入力フォーム</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="font-bold text-slate-600">AIモデル</Label>
              <RadioGroup value={modelProvider} onValueChange={setModelProvider} className="flex space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="openai" id="openai" /><Label htmlFor="openai">OpenAI (GPT-4o)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="gemini" id="gemini" /><Label htmlFor="gemini">Google (Gemini 2.5 Flash)</Label></div>
              </RadioGroup>
            </div>

            {Object.entries(schema.properties).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <Label htmlFor={key} className="font-bold text-slate-600">{value.description || key}</Label>
                {renderFormField(key, value)}
              </div>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isLoading} className="w-full !mt-8 bg-gradient-to-r from-pink-400 to-orange-300 text-white font-bold text-lg h-14 rounded-full shadow-lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 size-5" />テキストを生成する</>}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      <Card className={cardBaseClass}>
        <CardHeader><CardTitle className="text-slate-700">生成結果</CardTitle></CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading && <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader2 className="size-10 animate-spin text-pink-400" /></motion.div>}
            {error && <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-center">{error}</motion.p>}
            {generatedText && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <Textarea readOnly value={generatedText} className="w-full h-auto bg-white/50 text-base" rows={14} />
              </motion.div>
            )}
             {!isLoading && !error && !generatedText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400">
                <p>ここに結果が表示されます♪</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};