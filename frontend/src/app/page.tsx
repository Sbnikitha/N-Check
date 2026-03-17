"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && pipelineStep < 4) {
      interval = setInterval(() => {
        setPipelineStep((prev) => prev + 1);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading, pipelineStep]);

  const verifyContent = async () => {
    if (!input.trim()) {
      setError("Please paste some content first.");
      return;
    }
    setError(null);
    setResult(null);
    setIsLoading(true);
    setPipelineStep(0);

    try {
      // Connects to the local FastAPI backend (Uvicorn)
      const res = await fetch("http://localhost:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");

      setPipelineStep(4);
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "#ef4444"; // red
    if (score < 60) return "#f59e0b"; // yellow/orange
    return "#10b981"; // green
  };

  return (
    <main className="min-h-screen bg-[#0d0f14] text-gray-100 font-sans overflow-x-hidden relative p-6">
      <div className="fixed top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,_rgba(59,130,246,0.15)_0%,_rgba(0,0,0,0)_70%)] blur-[100px] -z-10 rounded-full" />
      
      <div className="max-w-4xl mx-auto pt-16 pb-24">
        <header className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
            TrustCheck <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-blue-600">AI</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">Paste anything suspicious. Know the truth in 10 seconds.</p>
        </header>

        <section className="flex flex-col gap-6 animate-fade-in-up transition-all mb-12 relative z-10">
          <textarea
            className="w-full h-48 bg-slate-900/60 border border-white/10 rounded-2xl p-6 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 backdrop-blur-md resize-y transition-all shadow-xl"
            placeholder="Paste a job offer, apartment listing, crypto DM, or suspicious email here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-red-400 font-semibold">{error}</p>}
          <button
            onClick={verifyContent}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-500/30"
          >
            {isLoading ? "Scanning & Verifying..." : "Verify Content Now"}
          </button>
        </section>

        {/* Loading Pipeline */}
        {isLoading && !result && (
          <section className="text-center mt-12 mb-16 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 text-blue-300">Initializing 6-Agent Neural Pipeline</h3>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              {['1. Content Classifier', '2. Entity & Claim Extractor', '3. Parallel Analysts (OSINT / Forensic)', '4. Verdict Synthesizer'].map((stepName, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    pipelineStep >= i 
                      ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.3)] text-blue-100 opacity-100' 
                      : 'border-white/10 bg-white/5 text-gray-500 opacity-40'
                  }`}
                >
                  {stepName}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {result && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl animate-fade-in shadow-2xl mt-8 relative z-20">
            <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/10 pb-10 mb-10">
              
              {/* Circular Gauge */}
              <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900/50"
                   style={{
                     background: `conic-gradient(${getScoreColor(result.trust_score)} ${result.trust_score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`
                   }}>
                <div className="absolute w-[130px] h-[130px] rounded-full bg-[#0d0f14] flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black">{result.trust_score}</span>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold mb-3" style={{ color: getScoreColor(result.trust_score) }}>
                  {result.trust_score < 30 ? "CRITICAL WARNING: SCAM DETECTED" 
                  : result.trust_score < 60 ? "Suspicious: Proceed with Extreme Caution" 
                  : "Verified: Appears Safe"}
                </h2>
                <p className="text-xl text-gray-300 font-medium mb-4">{result.recommendation}</p>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {result.final_verdict}
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-blue-500/20 p-2 rounded-lg text-blue-400">🔬</span> 
                Detailed Evidence & Fact Weightage
              </h3>
              <div className="grid gap-4">
                {result.facts_and_weights?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 border-l-4 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start"
                       style={{ borderLeftColor: item.weightage < 0 ? '#ef4444' : '#10b981' }}>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2 text-white">{item.fact}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.reasoning}</p>
                    </div>
                    <div className={`font-black text-lg px-4 py-2 rounded-lg whitespace-nowrap ${item.weightage < 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {item.weightage > 0 ? '+' : ''}{item.weightage} Pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-blue-300">
                <span className="text-2xl">📋</span> Action Plan
              </h3>
              <ul className="space-y-3">
                {result.plan_of_action?.map((action: string, idx: number) => (
                  <li key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 items-start">
                    <span className="text-blue-400 font-bold mt-1">→</span>
                    <span className="text-gray-300">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
