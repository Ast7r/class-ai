'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const BOOKS = [
  { id: 'biology', name: 'Biology', file: 'https://supabase.co' },
  { id: 'designzuragzui', name: 'Design Zuragzui', file: 'https://supabase.co' },
  { id: 'iregniiyoszui', name: 'Iregnii Yoszui', file: 'https://supabase.co' },
  { id: 'khimi', name: 'Chemistry (Khimi)', file: 'https://supabase.co' },
  { id: 'matematic', name: 'Mathematics (Matematic)', file: 'https://supabase.co' },
  { id: 'medeelliintechnology', name: 'Medeelliin Technology', file: 'https://supabase.co' },
  { id: 'mongoliintuukh', name: 'Mongolian History (Tuukh)', file: 'https://supabase.co' },
  { id: 'mongolkhel', name: 'Mongolian Language (Khel)', file: 'https://supabase.co' },
  { id: 'niigemsudlal', name: 'Niigem Sudlal', file: 'https://supabase.co' },
  { id: 'physic', name: 'Physics (Physic)', file: 'https://supabase.co' },
  { id: 'uranzohiol', name: 'Uran Zohiol', file: 'https://supabase.co' },
];

export default function StudyView({ apiKey }: { apiKey: string; user?: any }) {
  const [selectedBook, setSelectedBook] = useState(BOOKS[0]?.file || '');
  const [pageNumber, setPageNumber] = useState(1);
  const [taskType, setTaskType] = useState('Explain this page clearly');
  const [customPrompt, setCustomPrompt] = useState('');
  const [lengthMode, setLengthMode] = useState<'Short' | 'Medium' | 'Long'>('Medium');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renderPdfPageToBase64 = async (pdfUrl: string, pageNum: number): Promise<string> => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `//://unpkg.com{pdfjs.version}/build/pdf.worker.min.mjs`;
    
    // Explicitly typed as string option object
    const loadingTask = pdfjs.getDocument({ url: pdfUrl });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Fixed parameters: added missing canvas reference object
    await page.render({ 
      canvasContext: context, 
      viewport,
      canvas: canvas 
    } as any).promise;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl.split(',')[1] || '';
  };

  const handleAskAI = async () => {
    setError('');
    setAiResponse('');
    if (!apiKey) return setError('Paste your Gemini key in Settings first.');

    setLoading(true);
    try {
      const base64Data = await renderPdfPageToBase64(selectedBook, pageNumber);
      const promptRules = { Short: 'Answer in 2 sentences.', Medium: 'Answer in 1 standard paragraph.', Long: 'Answer in 3 paragraphs.' };
      const systemPrompt = `You are a tutor. Flowing paragraphs only. No lists, bullet points, or markdown titles. Wrap math in LaTeX delimiters like $x^2$ or $$y=mx+b$$. Length: ${promptRules[lengthMode]}`;

      const res = await fetch(`https://googleapis.com{apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: customPrompt || taskType }, { inlineData: { mimeType: 'image/jpeg', data: base64Data } }] }]
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error();
      setAiResponse(result.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.');
    } catch {
      setError('AI request failed. Check page number or API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Choose Subject Book</label>
            <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100">
              {BOOKS.map((b) => <option key={b.id} value={b.file}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">PDF Page Number</label>
            <input type="number" min={1} value={pageNumber} onChange={(e) => setPageNumber(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">What should the AI do?</label>
          <input type="text" placeholder="Optional: Type specific question (e.g., Solve problem #4)" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Answer Length</label>
          <div className="flex gap-2">
            {(['Short', 'Medium', 'Long'] as const).map((l) => (
              <button key={l} onClick={() => setLengthMode(l)} className={`flex-1 py-1.5 border text-sm rounded-lg ${lengthMode === l ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>{l}</button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={handleAskAI} disabled={loading} className="w-full bg-indigo-600 py-2.5 rounded-xl font-semibold text-sm transition-colors hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500">{loading ? 'AI is analyzing textbook page...' : 'Ask AI Tutor'}</button>
      </div>

      {aiResponse && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 leading-relaxed space-y-4 text-slate-200">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{aiResponse}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
