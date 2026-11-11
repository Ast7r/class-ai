'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const BOOKS = [
  { id: 'biology', name: '🧬 Biology', file: 'https://supabase.co' },
  { id: 'designzuragzui', name: '🎨 Design Zuragzui', file: 'https://supabase.co' },
  { id: 'iregniiyoszui', name: '⚖️ Iregnii Yoszui', file: 'https://supabase.co' },
  { id: 'khimi', name: '🧪 Chemistry (Khimi)', file: 'https://supabase.co' },
  { id: 'matematic', name: '📐 Mathematics (Matematic)', file: 'https://supabase.co' },
  { id: 'medeelliintechnology', name: '💻 Medeelliin Technology', file: 'https://supabase.co' },
  { id: 'mongoliintuukh', name: '🐎 Mongolian History (Tuukh)', file: 'https://supabase.co' },
  { id: 'mongolkhel', name: '🇲🇳 Mongolian Language (Khel)', file: 'https://supabase.co' },
  { id: 'niigemsudlal', name: '🌍 Niigem Sudlal', file: 'https://supabase.co' },
  { id: 'physic', name: '⚡ Physics (Physic)', file: 'https://supabase.co' },
  { id: 'uranzohiol', name: '📖 Uran Zohiol', file: 'https://supabase.co' },
];

export default function StudyView({ apiKey }: { apiKey: string; user?: any }) {
  const [selectedBook, setSelectedBook] = useState(BOOKS[0].file);
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
    
    const loadingTask = pdfjs.getDocument({ url: pdfUrl });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ 
      canvasContext: context, 
      viewport,
      canvas: canvas 
    } as any).promise;
    
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleAskAI = async () => {
    setError('');
    setAiResponse('');
    if (!apiKey) return setError('⚠️ Key required. Drop your Gemini token into settings first.');

    setLoading(true);
    try {
      const base64Data = await renderPdfPageToBase64(selectedBook, pageNumber);
      const promptRules = { 
        Short: 'Summarize compactly in 2 clean, punchy sentences.', 
        Medium: 'Explain beautifully inside 1 rich paragraph.', 
        Long: 'Provide an itemized breakdown across 3 professional paragraphs.' 
      };
      
      const systemPrompt = `You are an elite AI highschool tutor. Deliver logical, direct paragraphs. No raw markdown tags, bullet lists, or massive headers. Wrap complex math in LaTeX delimiters like $x^2$. Length instruction: ${promptRules[lengthMode]}`;

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
      setAiResponse(result.candidates?.[0]?.content?.parts?.[0]?.text || 'Tutor was unable to parse this page.');
    } catch {
      setError('Connection refused. Verify your page index or try another API token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-6 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/60 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Class Terminal AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Subject Textbook Parsing Engine</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium font-mono">Workspace Node: Stable</span>
        </div>
      </div>

      {/* Primary Configuration Workspace */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Subject Textbook</label>
            <select 
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)} 
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 transition focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer"
            >
              {BOOKS.map((b) => <option key={b.id} value={b.file}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Target Page</label>
            <input 
              type="number" 
              min={1} 
              value={pageNumber} 
              onChange={(e) => setPageNumber(Number(e.target.value))} 
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono" 
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">AI Execution Directive</label>
          <input 
            type="text" 
            placeholder="Describe action (e.g., Explain Section 3, transcribing formulas, breaking down diagrams...)" 
            value={customPrompt} 
            onChange={(e) => setCustomPrompt(e.target.value)} 
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" 
          />
        </div>

        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Response Resolution Profile</label>
          <div className="grid grid-cols-3 gap-3 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
            {(['Short', 'Medium', 'Long'] as const).map((l) => (
              <button 
                key={l} 
                onClick={() => setLengthMode(l)} 
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  lengthMode === l 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {l} Summary
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-medium">
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleAskAI} 
          disabled={loading} 
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 disabled:transform-none disabled:shadow-none cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
