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
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';

// --- 型定義 ---
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
  const [outputCount, setOutputCount] = useState(tool.outputCountDefault);
  const [generatedOutputs, setGeneratedOutputs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getInputSchema = useCallback((): InputSchema | null => {
    try {
      if (typeof tool.inputSchema === 'string') return JSON.parse(tool.inputSchema);
      return tool.inputSchema as unknown as InputSchema;
    } catch { return null; }
  }, [tool.inputSchema]);

  useEffect(() => {
    const schema = getInputSchema();
    const defaultFormData: Record<string, string> = {};
    if (schema && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (value.type === 'select' && value.enum?.length) {
          defaultFormData[key] = value.enum[0];
        } else {
          defaultFormData[key] = '';
        }
      }
    }
    setFormData(defaultFormData);
    setOutputCount(tool.outputCountDefault); // ツールが切り替わったらデフォルト値にリセット
  }, [tool.id, tool.outputCountDefault, getInputSchema]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (key: string, value: string) => {
    if (value) setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedOutputs([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id, inputData: formData, modelProvider, outputCount }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テキストの生成に失敗しました。');
      }
      const data = await response.json();
      setGeneratedOutputs(data.outputs);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const schema = getInputSchema();
  if (!schema) return <p className="text-destructive">フォームの定義が不正です。</p>;

  const cardBaseClass = "bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl border";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className={cardBaseClass}>
        <CardHeader><CardTitle className="text-slate-700">入力フォーム</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AIモデル選択 */}
            <div className="space-y-3">
              <Label className="font-bold text-slate-600">AIモデル</Label>
              <RadioGroup value={modelProvider} onValueChange={setModelProvider} className="flex space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="openai" id="openai" /><Label htmlFor="openai">OpenAI (GPT-4o)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="gemini" id="gemini" /><Label htmlFor="gemini">Google (Gemini 2.5 Flash)</Label></div>
              </RadioGroup>
            </div>

            {/* 動的フォーム */}
            {Object.entries(schema.properties).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <Label htmlFor={key} className="font-bold text-slate-600">{value.description || key}</Label>
                {/* Render logic based on value.type */}
                { value.type === 'select' && value.enum ? (
                    <ToggleGroup type="single" value={formData[key]} onValueChange={(val) => handleToggleChange(key, val)} className="flex-wrap justify-start gap-2">
                        {value.enum.map((option) => <ToggleGroupItem key={option} value={option} className="rounded-full data-[state=on]:bg-pink-400 data-[state=on]:text-white hover:bg-pink-100 transition-colors duration-200">{option}</ToggleGroupItem>)}
                    </ToggleGroup>
                ) : value.type === 'textarea' ? (
                    <Textarea id={key} name={key} value={formData[key] || ''} onChange={handleInputChange} required={schema.required?.includes(key)} placeholder={`${value.description}を詳しく入力...`} className="bg-white/50" rows={5} />
                ) : (
                    <Input id={key} name={key} value={formData[key] || ''} onChange={handleInputChange} required={schema.required?.includes(key)} placeholder={`${value.description}を入力...`} className="bg-white/50" />
                )}
              </div>
            ))}

            {/* 出力数 */}
            {tool.outputCountEnabled && (
              <div className="space-y-3">
                <Label htmlFor="outputCount" className="font-bold text-slate-600">生成する数</Label>
                <Input id="outputCount" type="number" value={outputCount} onChange={(e) => setOutputCount(Math.max(1, parseInt(e.target.value, 10)))} min="1" max="5" className="bg-white/50 w-24" />
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isLoading} className="w-full !mt-8 bg-gradient-to-r from-pink-400 to-orange-300 text-white font-bold text-lg h-14 rounded-full shadow-lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 size-5" />テキストを生成する</>}</Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      <Card className={`${cardBaseClass} min-h-[400px]`}>
        <CardHeader><CardTitle className="text-slate-700">生成結果</CardTitle></CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isLoading && <motion.div key="loader" className="flex justify-center items-center pt-16"><Loader2 className="size-10 animate-spin text-pink-400" /></motion.div>}
            {error && <motion.p key="error" className="text-red-500 text-center">{error}</motion.p>}
            {generatedOutputs.length > 0 && (
              <motion.div key="result" className="space-y-4">
                {generatedOutputs.map((text, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="relative">
                    <Textarea readOnly value={text} className="w-full h-auto bg-white/50 text-base pr-10" rows={text.split('\n').length + 1} />
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(text, index)} className="absolute top-2 right-2 text-slate-500 hover:text-pink-500">
                      {copiedIndex === index ? <Check className="size-5 text-pink-500" /> : <Copy className="size-5" />}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {!isLoading && !error && generatedOutputs.length === 0 && (
              <motion.div className="text-center text-slate-400 pt-16">
                <p>ここに結果が表示されます♪</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};