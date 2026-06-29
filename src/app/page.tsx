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
  { id: 'fridge', name: 'Réfrigérateur', icon: '🧊', commonIssues: ['Compresseur défaillant', 'Joint usé', 'Ventilateur bloqué'], listenDuration: 30 },
  { id: 'washer', name: 'Lave-linge', icon: '🫧', commonIssues: ['Roulement usé', 'Pompe défectueuse', 'Courroie détendue'], listenDuration: 60 },
  { id: 'dryer', name: 'Sèche-linge', icon: '♨️', commonIssues: ['Filtre encrassé', 'Tambour désaxé', 'Résistance défaillante'], listenDuration: 45 },
  { id: 'dishwasher', name: 'Lave-vaisselle', icon: '🍽️', commonIssues: ['Pompe bruyante', 'Bras de lavage bloqué', 'Fuite'], listenDuration: 45 },
  { id: 'hvac', name: 'Climatisation', icon: '❄️', commonIssues: ['Compresseur fatigué', 'Manque de gaz', 'Ventilateur encrassé'], listenDuration: 30 },
  { id: 'boiler', name: 'Chaudière', icon: '🔥', commonIssues: ['Circulateur défaillant', 'Pression anormale', 'Brûleur encrassé'], listenDuration: 30 },
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
          { type: 'Cycle normal', description: 'Tous les cycles sonores correspondent aux patterns de référence', severity: 'info' as const },
          { type: 'Vibrations', description: 'Niveau de vibration dans la norme', severity: 'info' as const }
        ],
        recommendations: ['Continuez la maintenance régulière', 'Prochain check recommandé dans 3 mois'],
        estimatedSavings: 0
      },
      {
        status: 'warning' as const,
        confidence: 87,
        findings: [
          { type: 'Anomalie sonore', description: 'Léger cliquetis détecté pendant le cycle', severity: 'warning' as const },
          { type: 'Fréquence inhabituelle', description: 'Harmonique à 120Hz supérieure à la normale (+15%)', severity: 'warning' as const },
          { type: 'Cycle', description: 'Durée de cycle légèrement allongée', severity: 'info' as const }
        ],
        predictedFailure: {
          component: appliance.commonIssues[Math.floor(Math.random() * appliance.commonIssues.length)],
          timeframe: '2-4 semaines',
          urgency: 'medium' as const
        },
        recommendations: [
          'Planifier une inspection dans les 2 semaines',
          'Surveiller l\'évolution du bruit',
          'Vérifier les fixations et joints'
        ],
        estimatedSavings: 180
      },
      {
        status: 'critical' as const,
        confidence: 91,
        findings: [
          { type: 'Bruit anormal', description: 'Grincement métallique détecté', severity: 'danger' as const },
          { type: 'Roulement', description: 'Signature sonore compatible avec roulement usé', severity: 'danger' as const },
          { type: 'Vibration excessive', description: 'Amplitude 3x supérieure à la normale', severity: 'warning' as const }
        ],
        predictedFailure: {
          component: appliance.commonIssues[0],
          timeframe: '3-7 jours',
          urgency: 'high' as const
        },
        recommendations: [
          '⚠️ Intervention urgente recommandée',
          'Éviter d\'utiliser l\'appareil si possible',
          'Contacter un technicien rapidement',
          'Préparer le remplacement si réparation >50% valeur'
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
                <p className="text-blue-300">Diagnostic d&apos;appareils par analyse sonore IA</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              📋 Historique ({recordings.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { value: '€320', label: 'Économie moyenne/an', icon: '💰' },
              { value: '89%', label: 'Précision diagnostic', icon: '🎯' },
              { value: '2-4 sem', label: 'Alerte avant panne', icon: '⏰' },
              { value: '30 sec', label: 'Temps d\'analyse', icon: '⚡' }
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
            <h2 className="text-xl font-semibold text-white mb-4">1. Sélectionne ton appareil</h2>
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
                  <div className="text-xs text-white/50 mt-1">~{appliance.listenDuration}s d&apos;écoute</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">2. Lance l&apos;analyse</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {!selectedAppliance ? (
                <div className="text-center py-12 text-white/50">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Sélectionne d&apos;abord un appareil à diagnostiquer</p>
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
                  <div className="text-white font-medium mb-2">Écoute en cours...</div>
                  <div className="text-white/60 text-sm mb-4">
                    Place ton téléphone près de l&apos;appareil
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
                    Annuler
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
                          {currentAnalysis.status === 'healthy' ? 'Appareil en bonne santé' :
                           currentAnalysis.status === 'warning' ? 'Attention requise' :
                           'Intervention urgente'}
                        </div>
                        <div className="text-sm opacity-80">
                          Confiance : {currentAnalysis.confidence}%
                        </div>
                      </div>
                    </div>
                    {currentAnalysis.estimatedSavings > 0 && (
                      <div className="text-right">
                        <div className="text-sm opacity-80">Économie potentielle</div>
                        <div className="text-xl font-bold">€{currentAnalysis.estimatedSavings}</div>
                      </div>
                    )}
                  </div>

                  {/* Predicted Failure */}
                  {currentAnalysis.predictedFailure && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                        <span>⏰</span> Panne prédite
                      </div>
                      <div className="text-white">
                        <strong>{currentAnalysis.predictedFailure.component}</strong>
                        <span className="text-white/60"> dans </span>
                        <strong>{currentAnalysis.predictedFailure.timeframe}</strong>
                      </div>
                    </div>
                  )}

                  {/* Findings */}
                  <div className="mb-4">
                    <div className="text-sm text-white/60 mb-2">Détails de l&apos;analyse</div>
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
                    <div className="text-sm text-white/60 mb-2">Recommandations</div>
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
                    🔄 Nouvelle analyse
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{selectedAppliance.icon}</div>
                  <div className="text-white font-medium mb-2">{selectedAppliance.name}</div>
                  <div className="text-white/60 text-sm mb-6">
                    Durée d&apos;écoute : ~{selectedAppliance.listenDuration} secondes
                  </div>
                  <div className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
                    Place ton téléphone à ~30cm de l&apos;appareil en fonctionnement, puis lance l&apos;analyse.
                  </div>
                  <button
                    onClick={startRecording}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                  >
                    🎙️ Commencer l&apos;écoute
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Comment ça marche ?</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { step: '1', icon: '📱', title: 'Place ton téléphone', desc: 'À ~30cm de l\'appareil en fonctionnement' },
              { step: '2', icon: '🎵', title: 'On écoute', desc: 'L\'IA capture les signatures sonores' },
              { step: '3', icon: '🧠', title: 'Analyse IA', desc: 'Comparaison avec 10 000+ patterns' },
              { step: '4', icon: '📊', title: 'Diagnostic', desc: 'Problèmes détectés + recommandations' }
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
              <h3 className="text-lg font-semibold text-white">Historique des analyses</h3>
              <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-4 space-y-3">
              {recordings.length === 0 ? (
                <p className="text-white/50 text-center py-8">Aucune analyse enregistrée</p>
              ) : (
                recordings.map(rec => (
                  <div key={rec.id} className={`p-3 rounded-lg border ${getStatusColor(rec.analysis?.status || 'healthy')}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{rec.appliance}</span>
                      <span className="text-xs opacity-70">
                        {new Date(rec.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-sm opacity-80 capitalize">
                      {rec.analysis?.status === 'healthy' ? '✅ Sain' :
                       rec.analysis?.status === 'warning' ? '⚠️ Attention' :
                       '🚨 Critique'}
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
