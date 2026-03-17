"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Search, 
  Fingerprint, 
  BrainCircuit, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Microscope,
  MessageSquareWarning,
  Scale
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 6 specialized AI agents configuration
const AGENTS = [
  { id: 'classifier', name: 'Classifier', icon: LayoutDashboard, desc: 'Identifies content type & risk' },
  { id: 'extractor', name: 'Entity Extractor', icon: Fingerprint, desc: 'Extracts claims & details' },
  { id: 'osint', name: 'OSINT Researcher', icon: Search, desc: 'Verifies external entities' },
  { id: 'forensic', name: 'Forensic Analyst', icon: Microscope, desc: 'Detects pattern anomalies' },
  { id: 'persuasion', name: 'Persuasion Detector', icon: MessageSquareWarning, desc: 'Analyzes manipulation' },
  { id: 'synthesizer', name: 'Verdict Synthesizer', icon: Scale, desc: 'Final score & action plan' }
];

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fake pipeline progress when loading (synced with actual backend delay if possible)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && activeStep < AGENTS.length - 1) {
      interval = setInterval(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading, activeStep]);

  const verifyContent = async () => {
    if (!input.trim()) {
      setError("Please paste some content first.");
      return;
    }
    setError(null);
    setResult(null);
    setIsLoading(true);
    setActiveStep(0);

    try {
      const res = await fetch("http://localhost:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");

      // Complete all steps
      setActiveStep(AGENTS.length - 1);
      
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
        setActiveStep(-1);
        // Smooth scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }, 800);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setActiveStep(-1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 35) return "text-red-500";
    if (score < 65) return "text-amber-500";
    return "text-emerald-500";
  };

  const getScoreBg = (score: number) => {
    if (score < 35) return "bg-red-500/20 shadow-red-500/20";
    if (score < 65) return "bg-amber-500/20 shadow-amber-500/20";
    return "bg-emerald-500/20 shadow-emerald-500/20";
  };

  const getStrokeDash = (score: number) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  return (
    <div className="min-h-screen mesh-gradient grid-bg text-slate-200">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-20 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full -z-20 animate-pulse-slow" />

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-blue-400 text-sm font-semibold mb-6 outline outline-blue-500/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>N-Check Neural Engine v2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-white"
          >
            Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">Truth.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium"
          >
            Our swarm of 6 specialized AI agents cross-references entities, analyzes psychology, and detects pattern anomalies in seconds.
          </motion.p>
        </header>

        {/* Input Area */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-4xl mx-auto mb-20 group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200" />
          <div className="relative glass-card rounded-[2rem] p-8 shadow-2xl">
            <textarea
              className="w-full h-56 bg-transparent border-none p-2 text-xl text-white placeholder-slate-600 focus:ring-0 resize-none font-medium leading-relaxed"
              placeholder="Paste job offers, rental listings, crypto messages, or anything suspicious here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Nvidia Nemotron Nano 9B Swarm</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                  <ExternalLink className="w-4 h-4" />
                  <span>Tavily Real-time Search</span>
                </div>
              </div>
              
              <button
                onClick={verifyContent}
                disabled={isLoading}
                className={cn(
                  "relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all group active:scale-95 disabled:opacity-70 disabled:active:scale-100",
                  isLoading ? "cursor-wait" : ""
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all" />
                <div className="flex items-center gap-3 relative z-10 text-white">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Swarm Orchestrating...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Risk</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 text-center text-red-400 font-bold bg-red-500/10 py-2 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}
        </motion.section>

        {/* Pipeline Visualization */}
        <AnimatePresence>
          {isLoading && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-5xl mx-auto mb-20 overflow-hidden"
            >
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">Multi-Agent Processing Stream</h3>
                <p className="text-slate-500 font-medium tracking-wide">STOCHASTIC AGENT SWARM ACTIVE</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {AGENTS.map((agent, i) => {
                  const Icon = agent.icon;
                  const isActive = activeStep === i;
                  const isDone = activeStep > i;
                  
                  return (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "relative flex flex-col items-center p-6 rounded-3xl glass-card transition-all duration-500 border-2",
                        isActive ? "border-blue-500/50 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/20" : 
                        isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center relative",
                        isActive ? "bg-blue-500 text-white animate-pulse" : 
                        isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"
                      )}>
                        <Icon className="w-6 h-6" />
                        {isDone && <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                      </div>
                      <h4 className={cn(
                        "font-bold text-sm mb-1 text-center truncate w-full",
                        isActive ? "text-blue-400" : isDone ? "text-emerald-400" : "text-slate-400"
                      )}>{agent.name}</h4>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isDone ? '100%' : isActive ? '50%' : '0%' }}
                          className={cn("h-full", isActive ? "bg-blue-400" : "bg-emerald-400")}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {result && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl overflow-x-hidden border border-white/10">
                {/* Score Header */}
                <div className="p-10 md:p-14 border-b border-white/5 flex flex-col md:flex-row items-center gap-12 bg-gradient-to-br from-white/[0.02] to-transparent">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96" cy="96" r="80"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="96" cy="96" r="80"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="transparent"
                        className={getScoreColor(result.trust_score)}
                        initial={{ strokeDashoffset: getStrokeDash(0) }}
                        animate={{ strokeDashoffset: getStrokeDash(result.trust_score) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeDasharray={2 * Math.PI * 80}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-6xl font-black text-white"
                      >
                        {result.trust_score}
                      </motion.span>
                      <span className="text-xs font-bold text-slate-500 tracking-[0.2em] -mt-1 uppercase">Trust Score</span>
                    </div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className={cn("inline-block px-5 py-2 rounded-full font-black text-sm mb-6 tracking-wide uppercase", getScoreBg(result.trust_score), getScoreColor(result.trust_score))}
                    >
                      {result.trust_score < 35 ? "Scam Probability: Critical" : 
                       result.trust_score < 65 ? "Analysis Result: Suspected Fraud" : 
                       "Consensus: High Confidence Safe"}
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white mb-6 tracking-tight leading-tight">
                        {result.trust_score < 35 && <AlertTriangle className="inline-block mr-3 text-red-500 w-10 h-10 mb-2" />}
                        {result.trust_score >= 65 && <ShieldCheck className="inline-block mr-3 text-emerald-500 w-10 h-10 mb-2" />}
                        {result.final_verdict}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {result.recommendation && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
                                <Info className="w-5 h-5 text-blue-400" />
                                <span className="text-slate-300 font-medium">{result.recommendation}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-px bg-white/5">
                  {/* Left: Facts Evidence */}
                  <div className="p-10 md:p-14 bg-[#0d0f14]/80">
                    <h3 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
                      <Microscope className="w-6 h-6 text-blue-400" />
                      Intelligence Forensic Data
                    </h3>
                    <div className="space-y-6">
                      {result.facts_and_weights?.map((item: any, idx: number) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group relative"
                        >
                          <div className={cn(
                            "absolute inset-y-0 left-0 w-1 rounded-full",
                            item.weightage < 0 ? "bg-red-500" : "bg-emerald-500"
                          )} />
                          <div className="pl-6 py-2 transition-transform group-hover:translate-x-1">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-slate-100">{item.fact}</h4>
                                <span className={cn(
                                    "text-sm font-black px-2 py-1 rounded",
                                    item.weightage < 0 ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"
                                )}>
                                    {item.weightage > 0 ? "+" : ""}{item.weightage}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.reasoning}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Action Plan */}
                  <div className="p-10 md:p-14 bg-[#0d0f14]/80 border-l border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-indigo-400" />
                      Mandatory Safety Protocol
                    </h3>
                    <div className="space-y-4">
                      {result.plan_of_action?.map((action: string, idx: number) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-black text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <span className="text-slate-300 font-medium leading-relaxed pt-1">{action}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Analysis Breakdown (Tags) */}
                <div className="bg-white/[0.02] p-10 border-t border-white/5">
                    <div className="flex flex-wrap gap-8 justify-center opacity-40 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nemotron Nano 9B</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">OSINT Swarm Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fact-Check Streamed</span>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-20 border-t border-white/5 opacity-40">
        <p className="text-sm font-bold tracking-widest text-slate-600 uppercase">
          &copy; 2024 N-Check AI. Neural Verification Protocol Approved.
        </p>
      </footer>
    </div>
  );
}
