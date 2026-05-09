"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, Loader2, AlertCircle, BarChart3,
  Wallet, MessageSquare, LogOut, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

const uploadStatement = async (file: File) => {
  const formData = new FormData();
  formData.append('statement', file);
  const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload statement');
  }
  return response.json();
};

const askChatAssistant = async (query: string, transactions: any[]) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, transactions }),
  });
  if (!response.ok) throw new Error('Failed to get chat response');
  return response.json();
};

function Chat({ transactions }: { transactions: any[] }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! Ask me anything about your finances.' }]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !transactions) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    try {
      const res = await askChatAssistant(userText, transactions);
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error connecting to AI assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[450px] w-full border border-zinc-800/50 rounded-2xl p-5 bg-zinc-950 shadow-2xl shadow-black/50">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl w-fit max-w-[85%] text-sm ${msg.role === 'ai' ? 'bg-zinc-900 text-zinc-200 self-start rounded-tl-sm border border-zinc-800/50' : 'bg-blue-600 text-white self-end ml-auto rounded-tr-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-zinc-500 text-sm italic animate-pulse">AI is analyzing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-black border border-zinc-800/50 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:shadow-[0_0_10px_rgba(37,99,235,0.2)] placeholder:text-zinc-600 transition-all"
          placeholder="e.g., How much did I spend on food?"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-xl disabled:opacity-50 font-medium hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]">
          Send
        </button>
      </div>
    </div>
  );
}

export default function DataSutramApp() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Smooth progress bar simulation when uploading
  useEffect(() => {
    let interval: any;
    if (uploadState === 'uploading') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          // Increment progress slowly for a smoother feel
          return prev + Math.random() * 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [uploadState]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setProgress(0);
    setUploadState('uploading');
    try {
      const data = await uploadStatement(file);
      
      // smoothly animate to 100%
      setProgress(100);
      
      // Delay showing dashboard to let the progress bar animation finish visually
      setTimeout(() => {
        setParsedData(data);
        setUploadState('idle');
      }, 800);
      
    } catch (err: any) {
      setUploadState('error');
      setErrorMsg(err.message || 'Error processing document.');
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  });

  const { summary, transactions, insights } = parsedData || {};

  // Aggregate category spends for the PieChart
  const spendByCategory = useMemo(() => {
    if (!transactions) return [];
    const spends = transactions.filter((t: any) => t.type === 'DEBIT').reduce((acc: any, t: any) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(spends)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

  if (!parsedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans text-zinc-200 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob z-0"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob z-0" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob z-0" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">FinSight</h1>
            <p className="text-zinc-400 text-lg">Upload your bank statement to extract insights securely.</p>
          </div>

          <div className="bg-zinc-950/70 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
            <div className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900/50'}`}
              >
                <input {...getInputProps()} />
                {uploadState === 'idle' || uploadState === 'error' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-xl font-medium text-white mb-2">Drop your PDF statement here</p>
                    {uploadState === 'error' && (
                      <p className="text-red-400 flex items-center text-sm font-medium bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-lg backdrop-blur-md">
                        <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full py-6">
                    <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      <Loader2 size={24} className="text-blue-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Analyzing PDF with AI...</h3>
                    <p className="text-sm text-zinc-400 mb-6">Extracting transactions and generating insights.</p>
                    
                    {/* Smooth Progress Bar */}
                    <div className="w-full max-w-sm bg-zinc-900 rounded-full h-2.5 border border-zinc-800/80 overflow-hidden relative">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out relative bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/60 blur-[2px] rounded-r-full"></div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 font-mono">{Math.round(progress)}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black font-sans text-zinc-200 selection:bg-blue-500/30 relative overflow-hidden">
      {/* Dashboard Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[15%] -right-[10%] w-[45%] h-[45%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl p-6 flex flex-col shrink-0 relative z-20">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">FinSight</span>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl font-medium shadow-[inset_0_0_20px_rgba(37,99,235,0.05)] transition-all">
            <BarChart3 size={18} className="mr-3" /> Overview
          </button>
          <button onClick={() => setParsedData(null)} className="w-full flex items-center px-4 py-3 text-zinc-400 hover:bg-zinc-900/80 hover:text-white rounded-xl transition-all border border-transparent hover:border-zinc-800/50">
            <LogOut size={18} className="mr-3" /> Upload New
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <header className="mb-10 pb-6 border-b border-zinc-800/30 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Financial Overview</h1>
              <p className="text-zinc-400 text-sm">Statement processed successfully. Here are your AI-generated insights.</p>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Analysis Live</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-2xl shadow-xl shadow-black/50 hover:border-zinc-700 transition-colors group">
            <p className="text-sm font-medium text-zinc-400 mb-2">Total Inflow</p>
            <div className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all">₹{summary?.totalIn?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-2xl shadow-xl shadow-black/50 hover:border-zinc-700 transition-colors group">
            <p className="text-sm font-medium text-zinc-400 mb-2">Total Outflow</p>
            <div className="text-3xl font-bold text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(251,113,133,0.5)] transition-all">₹{summary?.totalOut?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-2xl shadow-xl shadow-black/50 hover:border-zinc-700 transition-colors group">
            <p className="text-sm font-medium text-zinc-400 mb-2">Net Balance</p>
            <div className={`text-3xl font-bold transition-all ${summary?.net >= 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]'}`}>
              ₹{summary?.net?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          <div className="xl:col-span-2 space-y-8">

            {/* Intuitive Chart Section */}
            <div className="bg-zinc-950 border border-zinc-800/50 rounded-2xl p-6 shadow-xl shadow-black/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center tracking-tight">
                <PieChartIcon size={20} className="mr-2 text-cyan-400" /> Spending by Category
              </h3>
              <div className="h-[250px] w-full">
                {spendByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {spendByCategory.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#e4e4e7', fontWeight: 500 }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">No debit transactions available</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-2xl p-6 shadow-xl shadow-black/50 backdrop-blur-sm h-fit">
                <h3 className="flex items-center text-lg font-semibold text-blue-400 mb-4 tracking-tight">
                  <MessageSquare size={20} className="mr-2" /> AI Insights
                </h3>
                <ul className="space-y-3">
                  {insights?.map((insight: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 bg-black/40 p-4 rounded-xl border border-blue-900/30 hover:border-blue-800/50 transition-colors leading-relaxed">
                      <span className="mr-2 opacity-80">💡</span> {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/50 rounded-2xl p-6 shadow-xl shadow-black/50 h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 tracking-tight shrink-0">Recent Transactions</h3>
                <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex-1">
                  {transactions?.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-400 text-center leading-tight shrink-0 group-hover:border-zinc-600 transition-colors">
                          {t.date.slice(0, 5)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">{t.description}</p>
                          <p className="text-[11px] text-cyan-400 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider">{t.category}</p>
                        </div>
                      </div>
                      <div className={`font-medium text-sm ${t.type === 'CREDIT' ? 'text-emerald-400' : 'text-zinc-300'} shrink-0 ml-4`}>
                        {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center tracking-tight">
              <MessageSquare size={20} className="mr-2 text-blue-500" /> AI Assistant
            </h3>
            <Chat transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}