import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Target,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Layers,
  Zap,
  Activity,
  ChevronRight,
  Github,
  Linkedin,
  Menu,
  X,
  AlertTriangle,
  Rocket,
  Shield,
  CheckCircle
} from 'lucide-react';
const TeamMember = ({ name, role, initial, imgSrc, github, linkedin }) => (
  <motion.div 
    whileHover={{ y: -10 }} 
    className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center group transition-all hover:bg-white/10"
  >
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mx-auto mb-6 p-1 shadow-lg shadow-cyan-500/20">
      <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
        {/* Only show image if imgSrc is NOT a placeholder string */}
        {imgSrc && !imgSrc.includes('path-to-your') ? (
          <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-cyan-400">{initial}</span>
        )}
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
    <p className="text-cyan-400 text-sm font-medium mb-4">{role}</p>
    <div className="flex justify-center gap-4 text-slate-500">
      {/* clickable links with target="_blank" so they open in a new tab */}
      <a href={github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
        <Github className="w-5 h-5" />
      </a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
        <Linkedin className="w-5 h-5" />
      </a>
    </div>
  </motion.div>
);
const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunch = () => {
    navigate('/dashboard'); // Change this to wherever your app lives
  };

  // Aegis Stats
  const stats = [
    { number: "10K+", label: "Prompts Tested" },
    { number: "3", label: "Semantic Tiers" },
    { number: "5+", label: "Emotions Mapped" },
    { number: "Live", label: "Vulnerability Scans" }
  ];

  const robustnessMetrics = [
    "Logical Consistency", "Factual Accuracy", "Entity Tracking", "Context Retention"
  ];

  // Aegis Features
  const features = [
    {
      icon: <Layers className="w-8 h-8 text-cyan-400" />,
      title: "Tiered Semantic Testing",
      description: "Evaluate structural robustness by applying Small, Moderate, and Huge perturbations to the baseline prompt.",
      tag: "Logic Flipping"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-purple-400" />,
      title: "Emotional Stress-Testing",
      description: "Test for emotional bias. We rewrite prompts in varying tones to see if aggressive or panicked framing manipulates AI reasoning.",
      tag: "Tone Manipulation"
    },
    {
      icon: <Activity className="w-8 h-8 text-cyan-400" />,
      title: "Automated Vulnerability Mapping",
      description: "Aegis automatically stress-tests the prompt to find exactly where and why the LLM's logic breaks down.",
      tag: "Heatmap Generation"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      title: "Overall Stability Score",
      description: "Get a clear metric on how stable the AI's reasoning is under semantic and emotional pressure.",
      tag: "0-100 Metric"
    }
  ];

  // Aegis Steps
  const steps = [
    {
      number: "01",
      title: "Enter Baseline Prompt",
      description: "Input the standard query or prompt you want to evaluate for AI hallucinations.",
      icon: <Brain className="w-6 h-6 text-cyan-400" />
    },
    {
      number: "02",
      title: "Set Stress Parameters",
      description: "Choose the level of semantic paraphrasing and select emotional framing (e.g., Panicked).",
      icon: <Zap className="w-6 h-6 text-purple-400" />
    },
    {
      number: "03",
      title: "Aegis Analysis",
      description: "Our system automatically modifies the prompt, queries the LLM, and compares the degraded outputs.",
      icon: <Activity className="w-6 h-6 text-cyan-400" />
    },
    {
      number: "04",
      title: "Map Vulnerabilities",
      description: "Review heatmaps and stability scores to identify hidden weaknesses in the AI's logic.",
      icon: <Target className="w-6 h-6 text-purple-400" />
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#020617]/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Aegis</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Team Code Blooded</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-slate-400 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How it Works</a>
              <a href="#team" className="text-slate-400 hover:text-white transition-colors">Meet the Team</a>
            </div>
            {/* Mobile Menu Button */}
            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pb-4 space-y-4 border-t border-white/10 pt-4"
            >
              <a href="#home" className="block text-slate-300 hover:text-white px-2">Home</a>
              <a href="#features" className="block text-slate-300 hover:text-white px-2">Features</a>
              <a href="#how-it-works" className="block text-slate-300 hover:text-white px-2">How it Works</a>
              <button onClick={handleLaunch} className="w-full mt-4 px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-lg">
                Launch System
              </button>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full shadow-lg backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-slate-300">Hack-Nocturne 2.0 Proposal</span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp} 
                className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white"
                >
                {/* Moving Gradient for Aegis */}
                <span className="text-6xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-flow mr-2">
                Aegis:
                </span> 
                <br />
                Stress-Test Your <br />
                {/* Moving Gradient for LLM Reasoning */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 animate-gradient-flow">
                LLM Reasoning
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                LLM logic is fragile. Aegis automatically applies semantic perturbations and emotional framing to map exactly where an AI's reasoning breaks down.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-2">
                <button onClick={handleLaunch} className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-[#020617] font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-xl shadow-white/10">
                  <span>Start Mapping</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
                  View Demo
                </button>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative lg:ml-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-2xl rounded-3xl" />
              <div className="relative bg-[#020617]/60 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Overall Stability Score</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white">68</span>
                      <span className="text-xl text-slate-500 font-bold">/100</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                    <TrendingDown className="w-7 h-7 text-red-400" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Vulnerabilities Detected</span>
                    <span className="text-red-400 font-bold">3 High Risk</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Verified Robustness</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {robustnessMetrics.map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 rounded-lg"
                      >
                        <CheckCircle className={`w-4 h-4 ${index > 1 ? 'text-yellow-400' : 'text-emerald-400'}`} />
                        <span className="text-xs font-medium text-slate-300">{metric}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Detecting the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Hidden Flaws</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Our system systematically attacks the structure and tone of prompts to uncover the boundaries of an LLM's capabilities.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm group">
                <div className="mb-6 inline-block p-4 bg-[#020617] rounded-xl border border-white/5 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>
                <div className="inline-flex items-center gap-2 bg-[#020617]/50 border border-white/5 px-3 py-1.5 rounded-md">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{feature.tag}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-gradient-to-b from-[#020617] to-[#0f172a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              How Aegis <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Maps Stability</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-0" />
            {steps.map((step, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: index * 0.15 }} className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-[#020617] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-black/50 mb-6 relative group">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 text-white font-bold text-sm flex items-center justify-center rounded-full shadow-lg">{step.number}</span>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="team" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Meet Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-gradient-flow">Code Blooded</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The minds behind Aegis, dedicated to making LLM reasoning more robust and reliable.
            </p>
          </motion.div>

          {/* This grid handles 4 members (2x2 on tablet, 1x4 on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <TeamMember 
                name="Ruhani Raman" 
                role="Frontend Developer" 
                initial="RR" 
                imgSrc={new URL('../assets/ruhani.jpeg', import.meta.url).href}
                github="https://https://github.com/ruhaniraman"
                linkedin="https://https://www.linkedin.com/in/ruhani-raman-340043327/"
            />
            <TeamMember 
                name="Manosh S" 
                role="Backend Developer" 
                initial="MS" 
                imgSrc={new URL('../assets/manosh.jpeg', import.meta.url).href}
                github="https://github.com/moserkfr" 
                linkedin="https://www.linkedin.com/in/manosh-suresh/"
            />
            <TeamMember 
                name="Rehan Mulla" 
                role="Backend Developer" 
                initial="RM" 
                imgSrc={new URL('../assets/rehan.jpeg', import.meta.url).href}
                github="https://github.com/rehan-mulla" 
                linkedin="https://www.linkedin.com/in/rehan-mulla-8719b62b8/"
            />
            <TeamMember 
                name="Sayan Soumya" 
                role="Backend Developer" 
                initial="SS" 
                imgSrc={new URL('../assets/sayan.jpeg', import.meta.url).href} 
                github="https://github.com/S-fury966" 
                linkedin="https://www.linkedin.com/in/sayan-soumya-303121354/"
            />
            </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Aegis by Team Code Blooded. Built for Hack-Nocturne 2.0.
        </p>
      </footer>
    </div> // This closes the main div
  );
};

export default LandingPage;
   