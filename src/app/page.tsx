'use client';

import { useState, useRef, useEffect } from 'react';

interface Recording {
  id: string;
  timestamp: Date;
  appliance: string;
  duration: number;
  analysis: AnalysisResult | null;
}

interface AnalysisResult {
  status: 'healthy' | 'warning' | 'critical';
  confidence: number;
  findings: Finding[];
  predictedFailure?: {
    component: string;
    timeframe: string;
    urgency: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
  estimatedSavings: number;
}

interface Finding {
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
}

interface Appliance {
  id: string;
  name: string;
  icon: string;
  commonIssues: string[];
  listenDuration: number;
  lastChecked?: Date;
  status?: 'healthy' | 'warning' | 'critical';
}

const APPLIANCES: Appliance[] = [
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', commonIssues: ['Failing compressor', 'Worn seal', 'Blocked fan'], listenDuration: 30 },
  { id: 'washer', name: 'Washing Machine', icon: '🫧', commonIssues: ['Worn bearing', 'Defective pump', 'Loose belt'], listenDuration: 60 },
  { id: 'dryer', name: 'Dryer', icon: '♨️', commonIssues: ['Clogged filter', 'Misaligned drum', 'Failing heating element'], listenDuration: 45 },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️', commonIssues: ['Noisy pump', 'Blocked spray arm', 'Leak'], listenDuration: 45 },
  { id: 'hvac', name: 'Air Conditioner', icon: '❄️', commonIssues: ['Tired compressor', 'Low refrigerant', 'Dirty fan'], listenDuration: 30 },
  { id: 'boiler', name: 'Boiler', icon: '🔥', commonIssues: ['Failing circulator', 'Abnormal pressure', 'Dirty burner'], listenDuration: 30 },
];

export default function SoundSense() {
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Load saved recordings from localStorage
    const saved = localStorage.getItem('soundsense-recordings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRecordings(parsed.map((r: Recording) => ({ ...r, timestamp: new Date(r.timestamp) })));
    }
  }, []);

  useEffect(() => {
    if (recordings.length > 0) {
      localStorage.setItem('soundsense-recordings', JSON.stringify(recordings));
    }
  }, [recordings]);

  const startRecording = () => {
    if (!selectedAppliance) return;
    
    setIsRecording(true);
    setRecordingProgress(0);
    setCurrentAnalysis(null);
    startTimeRef.current = Date.now();

    const duration = selectedAppliance.listenDuration * 1000;
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setRecordingProgress(progress);

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finishRecording();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopRecording = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
    setRecordingProgress(0);
  };

  const finishRecording = () => {
    setIsRecording(false);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = generateAnalysis(selectedAppliance!);
      setCurrentAnalysis(analysis);

      const newRecording: Recording = {
        id: Date.now().toString(),
        timestamp: new Date(),
        appliance: selectedAppliance!.name,
        duration: selectedAppliance!.listenDuration,
        analysis
      };

      setRecordings(prev => [newRecording, ...prev]);
    }, 1500);
  };

  const generateAnalysis = (appliance: Appliance): AnalysisResult => {
    // Randomized but realistic analysis
    const scenarios = [
      {
        status: 'healthy' as const,
        confidence: 94,
        findings: [
          { type: 'Normal cycle', description: 'All sound cycles match reference patterns', severity: 'info' as const },
          { type: 'Vibrations', description: 'Vibration level within normal range', severity: 'info' as const }
        ],
        recommendations: ['Continue regular maintenance', 'Next check recommended in 3 months'],
        estimatedSavings: 0
      },
      {
        status: 'warning' as const,
        confidence: 87,
        findings: [
          { type: 'Sound anomaly', description: 'Slight clicking detected during cycle', severity: 'warning' as const },
          { type: 'Unusual frequency', description: 'Harmonic at 120Hz higher than normal (+15%)', severity: 'warning' as const },
          { type: 'Cycle', description: 'Cycle duration slightly extended', severity: 'info' as const }
        ],
        predictedFailure: {
          component: appliance.commonIssues[Math.floor(Math.random() * appliance.commonIssues.length)],
          timeframe: '2-4 weeks',
          urgency: 'medium' as const
        },
        recommendations: [
          'Schedule an inspection within 2 weeks',
          'Monitor noise evolution',
          'Check fixings and seals'
        ],
        estimatedSavings: 180
      },
      {
        status: 'critical' as const,
        confidence: 91,
        findings: [
          { type: 'Abnormal noise', description: 'Metallic grinding detected', severity: 'danger' as const },
          { type: 'Bearing', description: 'Sound signature consistent with worn bearing', severity: 'danger' as const },
          { type: 'Excessive vibration', description: 'Amplitude 3x higher than normal', severity: 'warning' as const }
        ],
        predictedFailure: {
          component: appliance.commonIssues[0],
          timeframe: '3-7 days',
          urgency: 'high' as const
        },
        recommendations: [
          '⚠️ Urgent intervention recommended',
          'Avoid using the appliance if possible',
          'Contact a technician quickly',
          'Prepare for replacement if repair >50% value'
        ],
        estimatedSavings: 450
      }
    ];

    // Weight towards healthy for demo
    const weights = [0.5, 0.35, 0.15];
    const random = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    return scenarios[selectedIndex];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-400 bg-blue-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'danger': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🔊</div>
              <div>
                <h1 className="text-3xl font-bold text-white">SoundSense</h1>
                <p className="text-blue-300">AI-powered appliance diagnostics via sound analysis</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              📋 History ({recordings.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { value: '$320', label: 'Avg savings/year', icon: '💰' },
              { value: '89%', label: 'Diagnostic accuracy', icon: '🎯' },
              { value: '2-4 wks', label: 'Warning before failure', icon: '⏰' },
              { value: '30 sec', label: 'Analysis time', icon: '⚡' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appliance Selection */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">1. Select your appliance</h2>
            <div className="grid grid-cols-2 gap-3">
              {APPLIANCES.map(appliance => (
                <button
                  key={appliance.id}
                  onClick={() => {
                    setSelectedAppliance(appliance);
                    setCurrentAnalysis(null);
                  }}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    selectedAppliance?.id === appliance.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{appliance.icon}</div>
                  <div className="text-white font-medium">{appliance.name}</div>
                  <div className="text-xs text-white/50 mt-1">~{appliance.listenDuration}s listening</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">2. Start analysis</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {!selectedAppliance ? (
                <div className="text-center py-12 text-white/50">
                  <div className="text-4xl mb-4">👆</div>
                  <p>First select an appliance to diagnose</p>
                </div>
              ) : isRecording ? (
                <div className="text-center py-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                    <div className="absolute inset-4 rounded-full bg-blue-500/30 animate-pulse" />
                    <div className="absolute inset-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-4xl">{selectedAppliance.icon}</span>
                    </div>
                  </div>
                  <div className="text-white font-medium mb-2">Listening...</div>
                  <div className="text-white/60 text-sm mb-4">
                    Place your phone near the appliance
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-100"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : currentAnalysis ? (
                <div>
                  {/* Analysis Results */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 ${getStatusColor(currentAnalysis.status)}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {currentAnalysis.status === 'healthy' ? '✅' : 
                         currentAnalysis.status === 'warning' ? '⚠️' : '🚨'}
                      </span>
                      <div>
                        <div className="font-bold text-lg capitalize">
                          {currentAnalysis.status === 'healthy' ? 'Appliance is healthy' :
                           currentAnalysis.status === 'warning' ? 'Attention required' :
                           'Urgent intervention'}
                        </div>
                        <div className="text-sm opacity-80">
                          Confidence: {currentAnalysis.confidence}%
                        </div>
                      </div>
                    </div>
                    {currentAnalysis.estimatedSavings > 0 && (
                      <div className="text-right">
                        <div className="text-sm opacity-80">Potential savings</div>
                        <div className="text-xl font-bold">${currentAnalysis.estimatedSavings}</div>
                      </div>
                    )}
                  </div>

                  {/* Predicted Failure */}
                  {currentAnalysis.predictedFailure && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                        <span>⏰</span> Predicted failure
                      </div>
                      <div className="text-white">
                        <strong>{currentAnalysis.predictedFailure.component}</strong>
                        <span className="text-white/60"> in </span>
                        <strong>{currentAnalysis.predictedFailure.timeframe}</strong>
                      </div>
                    </div>
                  )}

                  {/* Findings */}
                  <div className="mb-4">
                    <div className="text-sm text-white/60 mb-2">Analysis details</div>
                    <div className="space-y-2">
                      {currentAnalysis.findings.map((finding, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${getSeverityColor(finding.severity)}`}>
                          <span>
                            {finding.severity === 'info' ? 'ℹ️' : 
                             finding.severity === 'warning' ? '⚠️' : '❌'}
                          </span>
                          <div>
                            <div className="font-medium">{finding.type}</div>
                            <div className="text-sm opacity-80">{finding.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <div className="text-sm text-white/60 mb-2">Recommendations</div>
                    <ul className="space-y-1">
                      {currentAnalysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-white flex items-start gap-2">
                          <span className="text-blue-400">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* New Analysis Button */}
                  <button
                    onClick={() => {
                      setCurrentAnalysis(null);
                      startRecording();
                    }}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium transition-colors"
                  >
                    🔄 New analysis
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{selectedAppliance.icon}</div>
                  <div className="text-white font-medium mb-2">{selectedAppliance.name}</div>
                  <div className="text-white/60 text-sm mb-6">
                    Listening time: ~{selectedAppliance.listenDuration} seconds
                  </div>
                  <div className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
                    Place your phone ~30cm from the running appliance, then start the analysis.
                  </div>
                  <button
                    onClick={startRecording}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                  >
                    🎙️ Start listening
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { step: '1', icon: '📱', title: 'Place your phone', desc: '~30cm from the running appliance' },
              { step: '2', icon: '🎵', title: 'We listen', desc: 'AI captures sound signatures' },
              { step: '3', icon: '🧠', title: 'AI analysis', desc: 'Comparison with 10,000+ patterns' },
              { step: '4', icon: '📊', title: 'Diagnosis', desc: 'Issues detected + recommendations' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-medium mb-1">{item.title}</div>
                <div className="text-white/50 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowHistory(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-white/10 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Analysis history</h3>
              <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-4 space-y-3">
              {recordings.length === 0 ? (
                <p className="text-white/50 text-center py-8">No recorded analysis</p>
              ) : (
                recordings.map(rec => (
                  <div key={rec.id} className={`p-3 rounded-lg border ${getStatusColor(rec.analysis?.status || 'healthy')}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{rec.appliance}</span>
                      <span className="text-xs opacity-70">
                        {new Date(rec.timestamp).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <div className="text-sm opacity-80 capitalize">
                      {rec.analysis?.status === 'healthy' ? '✅ Healthy' :
                       rec.analysis?.status === 'warning' ? '⚠️ Warning' :
                       '🚨 Critical'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
