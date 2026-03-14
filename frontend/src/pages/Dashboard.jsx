import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Map as MapIcon, 
  LineChart, 
  BarChart2, 
  ChevronLeft, 
  Send, 
  ShieldAlert,
  Sparkles,
  Loader2,
  Wand2
} from 'lucide-react';

// ─── Safe Plotly wrapper ───────────────────────────────────────────────────
const PlotlyHeatmap = ({ matrixData }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !matrixData) return;
    let cancelled = false;

    import('plotly.js-dist-min')
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        
        // FIX 1: Extract the default object if Vite wrapped it
        const Plotly = module.default || module;
        
        const n = matrixData.length;
        const labels = Array.from({ length: n }, (_, i) => `P${i + 1}`);
        
        Plotly.newPlot(
          containerRef.current,
          [{
            z: matrixData,
            x: labels,
            y: labels,
            type: 'heatmap',
            colorscale: 'RdBu',
            showscale: true,
          }],
          {
            autosize: true,
            margin: { t: 20, l: 40, r: 20, b: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            xaxis: { title: { text: 'Perturbed Prompts', font: { size: 12, color: '#cbd5e1' } } },
            yaxis: { title: { text: 'Perturbed Prompts', font: { size: 12, color: '#cbd5e1' } } }
          },
          { responsive: true, displayModeBar: false }
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      // FIX 2: Synchronously clear the container to prevent Strict Mode 
      // from asynchronously deleting the chart on the next render pass.
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [matrixData]);

  if (error) {
    return (
      <div className="w-full h-[450px] border border-red-500/30 rounded-2xl bg-red-950/20 flex items-center justify-center">
        <p className="text-red-400 font-mono text-sm">Plotly error: {error}</p>
      </div>
    );
  }

  // 💎 UPGRADED Premium Graph Container (Blue Theme & Larger) 💎
  return (
    <div className="relative group p-1">
      {/* Ambient background glow that brightens on hover - NOW BLUE */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/5 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
      
      {/* Main Glassmorphic Card - HEIGHT AT 650px */}
      <div className="relative w-full h-[650px] bg-[#020617]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 group-hover:border-blue-500/40">
        
        {/* Top Control Bar (HUD style) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/10 bg-blue-950/30">
          <div className="flex items-center gap-3">
            {/* Pulsing Active Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest">3D Topography Engine Active</span>
          </div>
          
          {/* Decorative Terminal Dots */}
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
          </div>
        </div>

        {/* The actual graph mounts here */}
        <div
          ref={containerRef}
          className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent cursor-move"
        />
      </div>
    </div>
  );
};

// ─── Error Boundary ────────────────────────────────────────────────────────
class SectionErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, message: '' }; }
  static getDerivedStateFromError(err) { return { hasError: true, message: err.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[200px] border border-red-500/30 rounded-2xl bg-red-950/20 flex flex-col items-center justify-center gap-2 p-6">
          <p className="text-red-400 font-bold">Render error in this section</p>
          <p className="text-red-300/70 font-mono text-xs text-center">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
// ─── Safe Plotly wrapper for Stability Map (Scatterplot) ──────────────
const PlotlyStabilityMap = ({ data }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    let cancelled = false;

    import('plotly.js-dist-min')
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        const Plotly = module.default || module;

        const yData = Array.isArray(data) ? data : data.scores || data.y || []; 
        const xData = Array.from({ length: yData.length }, (_, i) => `P${i + 1}`);

        Plotly.newPlot(
          containerRef.current,
          [{
            x: xData,
            y: yData,
            type: 'scatter',
            // ─── CHANGE 1: Enable markers ONLY to make it a scatterplot ───
            mode: 'markers', 
            // ─── CHANGE 2: Define dynamic color mapping ───
            marker: { 
              size: 16, // Keep the dots large like your current graph
              color: yData, // CRITICAL: Bind point color to the data (scores)!
              colorscale: 'Plasma', // Closer match to your target yellow-purple gradient!
              showscale: true, // THIS displays the gradient scale (colorbar) legend
              line: { width: 2, color: '#020617' } 
            },
            // Removed: lines, fill property, and fillcolor to remove the purple area
          }],
          {
            autosize: true,
            margin: { t: 20, l: 40, r: 20, b: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            xaxis: { title: { text: 'Perturbed Prompts', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b' },
            yaxis: { title: { text: 'Stability Score', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b' }
          },
          { responsive: true, displayModeBar: false }
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [data]);

  // 💎 CONSOLDATED Premium Graph Container 💎
  // We remove the separate 'if (error)' return and make a single return structure
  return (
    <div className="relative group p-1">
      {/* Ambient background glow that brightens on hover - NOW BLUE */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/5 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
      
      {/* Main Glassmorphic Card - HEIGHT AT 650px */}
      <div className="relative w-full h-[650px] bg-[#020617]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 group-hover:border-blue-500/40">
        
        {/* Top Control Bar (HUD style) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/10 bg-blue-950/30">
          <div className="flex items-center gap-3">
            {/* Pulsing Active Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest">3D Topography Engine Active</span>
          </div>
          
          {/* Decorative Terminal Dots */}
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
          </div>
        </div>

        {/* The actual graph or error mounts here */}
        {error ? (
          <div className="flex-1 w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
            <p className="text-red-400 font-mono text-sm">Plotly error: {error}</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent cursor-move"
          />
        )}
      </div>
    </div>
  );
};
// ─── Safe Plotly wrapper for Sensitivity Curve (Line Chart) ────────────
const PlotlySensitivityCurve = ({ data }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    let cancelled = false;

    import('plotly.js-dist-min')
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        const Plotly = module.default || module;

        const yData = Array.isArray(data) ? data : data.scores || data.y || []; 
        const xData = Array.from({ length: yData.length }, (_, i) => `P${i + 1}`);

        Plotly.newPlot(
          containerRef.current,
          [{
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            // Blue styling to match your UI and the target image!
            line: { color: '#3b82f6', width: 4, shape: 'spline' }, 
            marker: { size: 10, color: '#60a5fa', line: { width: 2, color: '#fff' } },
            fill: 'tozeroy', // Creates the shaded gradient below the line
            fillcolor: 'rgba(59, 130, 246, 0.1)'
          }],
          {
            autosize: true,
            margin: { t: 20, l: 40, r: 20, b: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            xaxis: { title: { text: 'Perturbed Prompts', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b' },
            yaxis: { title: { text: 'Degradation Variance', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b' }
          },
          { responsive: true, displayModeBar: false }
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [data]);

  if (error) {
    return (
      <div className="w-full h-[400px] border border-red-500/30 rounded-2xl bg-red-950/20 flex items-center justify-center">
        <p className="text-red-400 font-mono text-sm">Plotly error: {error}</p>
      </div>
    );
  }

  // 💎 UPGRADED Premium Graph Container (Blue Theme & Larger) 💎
  return (
    <div className="relative group p-1">
      {/* Ambient background glow that brightens on hover - NOW BLUE */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/5 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
      
      {/* Main Glassmorphic Card - HEIGHT AT 650px */}
      <div className="relative w-full h-[650px] bg-[#020617]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 group-hover:border-blue-500/40">
        
        {/* Top Control Bar (HUD style) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/10 bg-blue-950/30">
          <div className="flex items-center gap-3">
            {/* Pulsing Active Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest">3D Topography Engine Active</span>
          </div>
          
          {/* Decorative Terminal Dots */}
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
          </div>
        </div>

        {/* The actual graph mounts here */}
        <div
          ref={containerRef}
          className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent cursor-move"
        />
      </div>
    </div>
  );
};

// ─── Safe Plotly wrapper for 3D Stability Landscape ────────────────────
const PlotlyStabilityLandscape = ({ zData }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !zData) return;
    let cancelled = false;

    import('plotly.js-dist-min')
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        const Plotly = module.default || module;

        Plotly.newPlot(
          containerRef.current,
          [{
            z: zData,
            type: 'surface',
            colorscale: 'Electric', // A beautiful dark-mode friendly glow
            showscale: false, // Hides the colorbar to save space
            contours: {
              z: { 
                show: true, 
                usecolormap: true, 
                highlightcolor: "#34d399", 
                project: { z: true } 
              }
            }
          }],
          {
            autosize: true,
            margin: { t: 10, l: 10, r: 10, b: 10 }, // 3D graphs look best with tight margins
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            scene: {
              xaxis: { title: { text: 'Semantic Shift', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b', backgroundcolor: 'rgba(0,0,0,0)' },
              yaxis: { title: { text: 'Structural Shift', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b', backgroundcolor: 'rgba(0,0,0,0)' },
              zaxis: { title: { text: 'Stability', font: { size: 12, color: '#cbd5e1' } }, gridcolor: '#1e293b', backgroundcolor: 'rgba(0,0,0,0)' },
              camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
            }
          },
          { responsive: true, displayModeBar: false }
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zData]);

  if (error) {
    return (
      <div className="w-full h-[500px] border border-red-500/30 rounded-2xl bg-red-950/20 flex items-center justify-center">
        <p className="text-red-400 font-mono text-sm">Plotly error: {error}</p>
      </div>
    );
  }

  // 💎 UPGRADED Premium Graph Container (Blue Theme & Larger) 💎
  return (
    <div className="relative group p-1">
      {/* Ambient background glow that brightens on hover - NOW BLUE */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/5 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
      
      {/* Main Glassmorphic Card - HEIGHT AT 650px */}
      <div className="relative w-full h-[650px] bg-[#020617]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 group-hover:border-blue-500/40">
        
        {/* Top Control Bar (HUD style) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/10 bg-blue-950/30">
          <div className="flex items-center gap-3">
            {/* Pulsing Active Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest">3D Topography Engine Active</span>
          </div>
          
          {/* Decorative Terminal Dots */}
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-blue-400 transition-colors cursor-pointer"></div>
          </div>
        </div>

        {/* The actual graph mounts here */}
        <div
          ref={containerRef}
          className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent cursor-move"
        />
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // 💎 NEW: Scroll Spying (Intersection Observer) 💎
  useEffect(() => {
    // These IDs exactly match the <section id="..."> tags in your main content
    const sectionIds = ['summary', 'heatmap', 'stability-map', 'sensitivity', 'landscape'];
    
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        // When a section enters the top 30% of the screen, update the active tab
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null, // Uses the browser viewport
      rootMargin: '-20% 0px -70% 0px', // Triggers when the section hits the upper portion of the screen
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Tell the observer to watch all our sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Cleanup function
    return () => observer.disconnect();
  }, [results]); // We include 'results' so it re-calculates when the graphs render!

  // Smooth scroll to specific sections
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Connect to Python Backend
  const handleAnalyze = async () => {
    if (!prompt.trim()) return; 
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }), 
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success! Full Backend Data:", data);

      const rawMatrix = data.visualization_data?.similarity_matrix;
      const safeMatrix = Array.isArray(rawMatrix)
        ? rawMatrix.map(row => Array.isArray(row) ? row.map(Number) : [])
        : [];

      setResults({
        score: Math.round(data.metrics.final_score * 100), 
        status: data.metrics.final_interpretation || "Analyzed",
        summary: [
          `Overall Stability: ${data.metrics.final_interpretation}`,
          `Graph Score: ${data.metrics.graph_score} (Measures structural logic retention)`,
          `Hallucination Assessment: ${data.metrics.hallucination_interpretation}`
        ],
        executionTime: data.execution_time,
        prompts: data.perturbed_prompts,
        responses: data.responses,
        matrixData: safeMatrix.length > 0 ? safeMatrix : null,
        stabilityMapData: data.visualization_data?.prompt_scores || null,
        sensitivityCurveData: data.visualization_data?.prompt_scores 
          ? data.visualization_data.prompt_scores.map(score => Math.max(0, 1 - score)) 
          : null,
        landscapeData: safeMatrix.length > 0 ? safeMatrix : null,
      });

    } catch (error) {
      console.error("Failed to fetch:", error);
      setResults({
        score: 0,
        status: "Error",
        summary: [
          "Connection to backend failed.",
          "Please ensure your FastAPI server is running on port 8000.",
          "Verify CORS is correctly enabled in main.py."
        ],
        matrixData: null,
        stabilityMapData: null,
        sensitivityCurveData: null,
        landscapeData: null
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#020617]/80 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Aegis</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-2">Navigation</p>
          
          <SidebarLink 
            icon={<LayoutDashboard />} label="Summary & Score" 
            isActive={activeTab === 'summary'} onClick={() => scrollToSection('summary')} 
          />
          <SidebarLink 
            icon={<Activity />} label="Similarity Heatmap" 
            isActive={activeTab === 'heatmap'} onClick={() => scrollToSection('heatmap')} 
          />
          <SidebarLink 
            icon={<MapIcon />} label="Stability Map" 
            isActive={activeTab === 'stability-map'} onClick={() => scrollToSection('stability-map')} 
          />
          <SidebarLink 
            icon={<LineChart />} label="Sensitivity Curve" 
            isActive={activeTab === 'sensitivity'} onClick={() => scrollToSection('sensitivity')} 
          />
          <SidebarLink 
            icon={<BarChart2 />} label="Stability Landscape" 
            isActive={activeTab === 'landscape'} onClick={() => scrollToSection('landscape')} 
          />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* 💎 BOLDER ANIMATED BACKGROUND GLOWS 💎 */}
        <motion.div 
          animate={{ 
            x: [0, 120, -80, 0], 
            y: [0, 80, -120, 0],
            scale: [1, 1.3, 0.8, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          // Increased opacity to /30, reduced blur slightly, and used fixed sizes (500px)
          className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-[100px] pointer-events-none z-0" 
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 100, 0], 
            y: [0, -100, 120, 0],
            scale: [1, 0.8, 1.4, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          // Increased opacity to /30, reduced blur slightly, and used fixed sizes (600px)
          className="fixed bottom-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/30 blur-[120px] pointer-events-none z-0" 
        />

        <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-24">
          
          {/* SECTION 1: Prompt Input & Summary */}
          <section id="summary" className="space-y-8 pt-4">
            <div>
              {/* 💎 UPDATED: Perfect 3-word-per-line formatting 💎 */}
              <h2 className="text-5xl md:text-6xl font-black mb-4 text-white leading-tight">
                Test Your{' '}
                <motion.span 
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto]"
                >
                  LLM
                </motion.span>
                
                <br /> {/* This forces the exact line break you want */}

                <motion.span 
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto]"
                >
                  Stability
                </motion.span>
                {' '}With Us
              </h2>
              <p className="text-slate-400 text-lg">Enter your baseline prompt below to stress-test its logic and stability.</p>
            </div>

            {/* Input Box */}
            {/* 💎 UPGRADED Premium Input Box 💎 */}
            <div className="relative group bg-[#020617]/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_40px_rgba(6,182,212,0.15)] focus-within:bg-[#0f172a]/80">
              
              {/* Subtle background glow that follows focus */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />

              {/* Textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Explain the theory of relativity as if I were a 5-year-old..."
                className="w-full h-40 bg-transparent text-slate-100 placeholder-slate-600 p-6 text-lg leading-relaxed focus:outline-none resize-none relative z-10 custom-scrollbar"
              />
              
              {/* Bottom Action Bar (Footer) */}
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-[#0f172a]/80 border-t border-slate-700/50">
                
                {/* Left side decorative status */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 px-2">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                   <span>Aegis Pipeline Ready</span>
                </div>

                {/* Right side buttons */}
                <div className="flex justify-end items-center gap-3 w-full sm:w-auto">
                  
                  {/* 💎 OPTIMIZE CODE BUTTON - NOW IN PURPLE/INDIGO 💎 */}
                  <button 
                    onClick={() => navigate('/optimize', { state: { analyzedPrompt: prompt } })}
                    disabled={!results || isAnalyzing || results.status === "Error"}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <Wand2 className="w-5 h-5" />
                    Optimize Prompt
                  </button>

                  {/* Analyze Prompt Button */}
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !prompt.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Area */}
            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="grid md:grid-cols-3 gap-6 pt-4"
              >
                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-slate-400 font-medium mb-2">Overall Stability Score</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{results.score}</span>
                    <span className="text-xl text-slate-500">/100</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${results.status === "Error" ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    <Sparkles className="w-4 h-4" /> {results.status}
                  </div>
                </div>

                {/* Detailed Summary Card */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" /> Detailed Summary
                    </div>
                    {/* LATENCY BADGE */}
                    {results.executionTime && (
                      <span className="text-xs font-mono bg-[#020617] text-slate-400 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-400" /> {results.executionTime}s
                      </span>
                    )}
                  </h3>
                  
                  <ul className="space-y-4 text-slate-300">
                    {Array.isArray(results.summary) ? (
                      results.summary.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${results.status === "Error" ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`} />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))
                    ) : (
                      <p>{results.summary}</p>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* RESPONSE VIEWER (Placed right below the summary cards) */}
            {results && results.prompts && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mt-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Pipeline Response Viewer
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {results.prompts.map((p, idx) => (
                    <div key={idx} className="bg-[#020617]/50 border border-white/5 rounded-xl p-5">
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-1 rounded">
                          Perturbation {idx + 1}
                        </span>
                        <p className="text-sm text-slate-200 mt-3 font-medium">{p}</p>
                      </div>
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded">
                          TinyLlama Output
                        </span>
                        <p className="text-sm text-slate-400 mt-3 leading-relaxed italic">
                          "{results.responses[idx]}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </section>

          {/* SECTION 2: Similarity Heatmap */}
          <section id="heatmap" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <Activity className="text-cyan-400" /> Similarity Heatmap
              </h2>
              <p className="text-slate-400">Visualizes the cosine similarity between the baseline prompt and perturbed outputs.</p>
            </div>
            
            {results?.matrixData ? (
              <SectionErrorBoundary>
                <PlotlyHeatmap matrixData={results.matrixData} />
              </SectionErrorBoundary>
            ) : (
              <GraphPlaceholder title="Similarity Heatmap" dataLoaded={false} />
            )}
          </section>

          {/* SECTION 3: Stability Map */}
          <section id="stability-map" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <MapIcon className="text-purple-400" /> Stability Map
              </h2>
              <p className="text-slate-400">Maps structural logical degradation across Small, Moderate, and Huge semantic shifts.</p>
            </div>
            
            {results?.stabilityMapData ? (
              <SectionErrorBoundary>
                <PlotlyStabilityMap data={results.stabilityMapData} />
              </SectionErrorBoundary>
            ) : (
              <GraphPlaceholder title="Stability Map" dataLoaded={false} />
            )}

          </section>
          {/* SECTION 4: Sensitivity Curve */}
          <section id="sensitivity" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <LineChart className="text-blue-400" /> Sensitivity Curve
              </h2>
              <p className="text-slate-400">Tracks how rapidly the LLM hallucinates as emotional framing intensity increases.</p>
            </div>
            
            {results?.sensitivityCurveData ? (
              <SectionErrorBoundary>
                <PlotlySensitivityCurve data={results.sensitivityCurveData} />
              </SectionErrorBoundary>
            ) : (
              <GraphPlaceholder title="Sensitivity Curve" dataLoaded={false} />
            )}

          </section>

          {/* SECTION 5: Stability Landscape */}
          <section id="landscape" className="scroll-mt-12 space-y-6 pb-24">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <BarChart2 className="text-emerald-400" /> Stability Landscape
              </h2>
              <p className="text-slate-400">A 3D representation of prompt robustness combining semantic and emotional vectors.</p>
            </div>
            
            {results?.landscapeData ? (
              <SectionErrorBoundary>
                <PlotlyStabilityLandscape zData={results.landscapeData} />
              </SectionErrorBoundary>
            ) : (
              <GraphPlaceholder title="Stability Landscape" dataLoaded={false} />
            )}
            
          </section>

          <button 
            onClick={() => navigate('/optimize', { state: { analyzedPrompt: prompt } })}
            disabled={!results || isAnalyzing || results.status === "Error"}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed mx-auto"
          >
            <Wand2 className="w-6 h-6" />
            Optimize Prompt
          </button>

        </div>
      </main>
    </div>
  );
};

/// ─── Upgraded Premium Sidebar Link ─────────────────────────────────────────
const SidebarLink = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-left overflow-hidden ${
      isActive 
        ? 'text-cyan-400 bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 shadow-[inset_4px_0_20px_rgba(6,182,212,0.05)]' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
    }`}
  >
    {/* Glowing Left Accent Line (Only visible when active) */}
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] rounded-l-xl" />
    )}
    
    {/* Icon with smooth hover scale */}
    <div className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-110 group-hover:text-cyan-300'}`}>
      {React.cloneElement(icon, { className: 'w-5 h-5 relative z-10' })}
    </div>
    
    {/* Text with smooth hover slide */}
    <span className={`relative z-10 transition-transform duration-300 ${!isActive && 'group-hover:translate-x-1'}`}>
      {label}
    </span>
    
    {/* Subtle hover background glow */}
    {!isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
    )}
  </button>
);

// Updated Graph Placeholder to react to data
const GraphPlaceholder = ({ title, dataLoaded }) => (
  <div className={`w-full h-[400px] border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${dataLoaded ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-[#0f172a]/50 border-white/5 text-slate-500'}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px]" />
    <Activity className={`w-12 h-12 mb-4 ${dataLoaded ? 'opacity-100 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'opacity-20'}`} />
    <p className={`font-mono text-sm relative z-10 ${dataLoaded ? 'text-white font-bold' : ''}`}>{title}</p>
    
    {dataLoaded ? (
      <p className="text-xs mt-3 relative z-10 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Data successfully loaded from backend
      </p>
    ) : (
      <p className="text-xs mt-2 opacity-50 relative z-10">Awaiting Graph Rendering</p>
    )}
  </div>
);

export default Dashboard;