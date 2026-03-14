import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Wand2, 
  ChevronLeft, 
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Zap,
  Scale,
  Loader2,
  LayoutDashboard
} from 'lucide-react';

// ─── Safe Plotly wrapper for Before/After Comparison ─────────────────────
const PlotlyComparisonChart = ({ originalMetrics, optimizedMetrics }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !originalMetrics || !optimizedMetrics) return;
    let cancelled = false;

    import('plotly.js-dist-min')
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        const Plotly = module.default || module;

        const trace1 = {
          x: ['Stability Score', 'Semantic Logic', 'Hallucination Safety'],
          y: originalMetrics,
          name: 'Original Prompt',
          type: 'bar',
          marker: { color: '#475569' } // Slate gray
        };

        const trace2 = {
          x: ['Stability Score', 'Semantic Logic', 'Hallucination Safety'],
          y: optimizedMetrics,
          name: 'Optimized Prompt',
          type: 'bar',
          marker: { color: '#a855f7' } // 💎 UPDATED: Purple to match new theme
        };

        Plotly.newPlot(
          containerRef.current,
          [trace1, trace2],
          {
            barmode: 'group',
            autosize: true,
            margin: { t: 40, l: 40, r: 20, b: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            legend: { orientation: 'h', y: 1.1 },
            yaxis: { range: [0, 100], gridcolor: '#1e293b' }
          },
          { responsive: true, displayModeBar: false }
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [originalMetrics, optimizedMetrics]);

  if (error) {
    return <div className="text-red-400 font-mono p-4">Plotly error: {error}</div>;
  }

  return <div ref={containerRef} className="w-full h-[300px]" />;
};
// ──────────────────────────────────────────────────────────────────────────

const Optimizer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.analyzedPrompt || '');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState(null);

  // Connect to your new Python endpoint
  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    
    try {
      // NOTE: Update this URL to match your new FastAPI optimization endpoint
      const response = await fetch("http://127.0.0.1:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }), 
      });

      if (!response.ok) throw new Error("Optimization failed");
      const data = await response.json();

      setResults(data);

    } catch (error) {
      console.error(error);
      // Fallback dummy data for UI testing if backend isn't ready yet
      setResults({
        optimized_prompt: "Explain the fundamental mechanics of the theory of relativity using analogies suitable for a 5-year-old child. Structure the response in 3 concise bullet points.",
        original_tokens: 42,
        optimized_tokens: 28,
        original_metrics: [55, 62, 45],
        optimized_metrics: [94, 91, 98]
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    // 💎 UPDATED: Selection color to cyan 💎
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* MINIMAL SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#020617]/80 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-8">
            {/* 💎 UPDATED: Logo icon gradient matches dashboard 💎 */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Aegis Optimize</h1>
          </div>
          
          <div className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/5">
              <LayoutDashboard className="w-5 h-5" /> Analytics Dashboard
            </button>
            
            {/* 💎 UPDATED: Active sidebar link exactly matches dashboard style 💎 */}
            <button className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-cyan-400 bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 shadow-[inset_4px_0_20px_rgba(6,182,212,0.05)] overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] rounded-l-xl" />
              <Wand2 className="w-5 h-5 relative z-10" /> 
              <span className="relative z-10">Prompt Optimizer</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* 💎 UPDATED: ANIMATED BACKGROUND GLOWS from Dashboard 💎 */}
        <motion.div 
          animate={{ 
            x: [0, 120, -80, 0], 
            y: [0, 80, -120, 0],
            scale: [1, 1.3, 0.8, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-[100px] pointer-events-none z-0" 
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 100, 0], 
            y: [0, -100, 120, 0],
            scale: [1, 0.8, 1.4, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="fixed bottom-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/30 blur-[120px] pointer-events-none z-0" 
        />

        <div className="max-w-6xl mx-auto space-y-8 p-8 lg:p-12 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {/* 💎 UPDATED: Icon color */}
              <Wand2 className="text-purple-400" /> Prompt Optimizer
            </h2>
            <p className="text-slate-400">Refine your fragile prompts into highly stable, token-efficient structures.</p>
          </div>

          {/* INPUT/OUTPUT SPLIT SCREEN */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Left Side: Original */}
            <div className="bg-[#020617]/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col h-[350px] backdrop-blur-xl focus-within:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Prompt</span>
                {results && (
                  <span className="text-xs font-mono text-slate-300 bg-[#0f172a] px-2 py-1 rounded-md border border-white/10">
                    Tokens: {results.original_tokens}
                  </span>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste your baseline prompt here..."
                className="flex-1 w-full bg-transparent rounded-xl text-slate-300 p-4 focus:outline-none resize-none custom-scrollbar"
              />
            </div>

            {/* Right Side: Optimized */}
            {/* 💎 UPDATED: Container to Purple Theme 💎 */}
            <div className="bg-[#020617]/60 border border-purple-500/20 rounded-2xl p-4 flex flex-col h-[350px] relative shadow-[0_0_30px_rgba(168,85,247,0.05)] backdrop-blur-xl">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Optimized Result
                </span>
                {results && (
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/50 px-2 py-1 rounded-md border border-purple-500/30">
                    Tokens: {results.optimized_tokens} 
                    <span className="text-purple-400 ml-2">({results.original_tokens - results.optimized_tokens} saved)</span>
                  </span>
                )}
              </div>
              
              {isOptimizing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-purple-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="animate-pulse text-sm">Restructuring logic constraints...</p>
                </div>
              ) : results ? (
                <div className="flex-1 w-full bg-[#0f172a]/50 rounded-xl p-4 text-purple-50 overflow-y-auto border border-purple-500/10 shadow-inner custom-scrollbar">
                  {results.optimized_prompt}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 italic text-sm">
                  Run optimization to view results
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center -mt-12 relative z-20">
            {/* 💎 UPDATED: Purple/Indigo Gradient Button with custom glow 💎 */}
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing || !prompt.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Optimize Prompt <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* ANALYTICS DASHBOARD */}
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6 pt-8"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center relative overflow-hidden">
                {/* 💎 UPDATED: Added subtle glow to the stat card 💎 */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2 relative z-10">
                  <Zap className="text-yellow-400 w-5 h-5" /> Token Efficiency
                </h3>
                <div className="flex items-end gap-2 mb-1 relative z-10">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {Math.round((1 - (results.optimized_tokens / results.original_tokens)) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-cyan-400 relative z-10">Reduction in prompt mass</p>
              </div>

              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                  <Scale className="w-5 h-5 text-purple-400" /> Pre & Post Optimization Metrics
                </h3>
                <div className="relative z-10">
                  <PlotlyComparisonChart 
                    originalMetrics={results.original_metrics} 
                    optimizedMetrics={results.optimized_metrics} 
                  />
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Optimizer;