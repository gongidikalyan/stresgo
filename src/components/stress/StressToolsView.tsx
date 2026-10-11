import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Sparkles,
  Fingerprint,
  ChevronLeft,
  Square,
  Activity,
  Smile,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  Send,
  Bell,
  Waves,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { StressToolId, StressCategory } from '../../types';
import { STRESS_TOOLS_CATALOG } from '../../data/sanctuaryContent';
import { soundEngine } from '../../services/soundEngine';
import { storageService } from '../../services/storage';
import { TeddyStressBuster } from './TeddyStressBuster';

interface StressToolsViewProps {
  initialToolId?: StressToolId;
  onBackToHome?: () => void;
}

interface ControlItem {
  id: string;
  text: string;
  type: 'within' | 'outside';
}

export const StressToolsView: React.FC<StressToolsViewProps> = ({
  initialToolId = 'teddy_bop',
  onBackToHome,
}) => {
  const [activeTool, setActiveTool] = useState<StressToolId>(initialToolId);
  const [selectedCategory, setSelectedCategory] = useState<StressCategory>('all');

  // Audio Engine State
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [isPlayingBrownNoise, setIsPlayingBrownNoise] = useState(false);

  // 1. SOS Calm State
  const [sosPhase, setSosPhase] = useState<'breathe_in' | 'hold' | 'breathe_out'>('breathe_in');
  const [sosMessageIndex, setSosMessageIndex] = useState(0);
  const [isSosActive, setIsSosActive] = useState(true);
  const sosMessages = [
    'You are safe in this physical moment.',
    'Your body knows how to settle. Drop your shoulders.',
    'This adrenaline will peak and pass naturally.',
    'Breathe out slower than you breathe in.',
    'Feel your feet firmly on the ground.',
  ];

  // 2. Bilateral Tapping (Butterfly Hug) State
  const [isTappingActive, setIsTappingActive] = useState(false);
  const [activeTapSide, setActiveTapSide] = useState<'left' | 'right'>('left');
  const [tappingDuration, setTappingDuration] = useState<60 | 180>(60);
  const [tappingSecondsRemaining, setTappingSecondsRemaining] = useState<number>(60);
  const [tapRounds, setTapRounds] = useState(0);
  const [isTapSoundEnabled, setIsTapSoundEnabled] = useState(true);

  // 3. Circle of Control State
  const [controlInput, setControlInput] = useState('');
  const [controlItems, setControlItems] = useState<ControlItem[]>([
    { id: 'c1', text: 'My own breath & reactions', type: 'within' },
    { id: 'c2', text: 'How I treat myself right now', type: 'within' },
    { id: 'c3', text: 'Other people\'s opinions', type: 'outside' },
    { id: 'c4', text: 'Unexpected traffic or delays', type: 'outside' },
  ]);
  const [dissolvingControlId, setDissolvingControlId] = useState<string | null>(null);

  // 4. Brown Noise Generator State
  const [brownNoiseVolume, setBrownNoiseVolume] = useState(0.7);
  const [brownNoiseTimerMinutes, setBrownNoiseTimerMinutes] = useState<number | null>(15);
  const [brownNoiseSecondsRemaining, setBrownNoiseSecondsRemaining] = useState<number | null>(null);

  // 5. Perspective 10/10/10 State
  const [perspectiveStressor, setPerspectiveStressor] = useState('');
  const [ans10Days, setAns10Days] = useState('');
  const [ans10Months, setAns10Months] = useState('');
  const [ans10Years, setAns10Years] = useState('');
  const [isPerspectiveSaved, setIsPerspectiveSaved] = useState(false);

  // 6. Physiological Sigh State
  const [isSighActive, setIsSighActive] = useState(false);
  const [sighPhase, setSighPhase] = useState<'inhale1' | 'inhale2' | 'exhale' | 'ready'>('ready');
  const [sighRounds, setSighRounds] = useState(0);

  // 7. Box Breathing State
  const [isBoxActive, setIsBoxActive] = useState(false);
  const [boxSide, setBoxSide] = useState<'top' | 'right' | 'bottom' | 'left'>('top');
  const [boxCount, setBoxCount] = useState(4);
  const [boxRounds, setBoxRounds] = useState(0);

  // 8. 4-7-8 Breath State
  const [is478Active, setIs478Active] = useState(false);
  const [phase478, setPhase478] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [count478, setCount478] = useState(4);

  // 9. Calming Stone State
  const [isStonePressed, setIsStonePressed] = useState(false);
  const [stoneSeconds, setStoneSeconds] = useState(0);
  const stoneIntervalRef = useRef<number | null>(null);

  // 10. Worry Dissolve State
  const [worryInput, setWorryInput] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [isDissolved, setIsDissolved] = useState(false);

  // 11. Grounding 5-4-3-2-1 State
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingList = [
    { num: 5, label: 'SEE', prompt: 'Notice 5 things you can visually see in this room.' },
    { num: 4, label: 'TOUCH', prompt: 'Notice 4 physical textures or contact points.' },
    { num: 3, label: 'HEAR', prompt: 'Notice and hear 3 distinct subtle sounds in your surroundings.' },
    { num: 2, label: 'SMELL', prompt: 'Notice 2 scents or the fresh air temperature.' },
    { num: 1, label: 'HEART', prompt: 'Take 1 gentle breath and feel your presence.' },
  ];

  // 12. Body De-Tense PMR State
  const [pmrStep, setPmrStep] = useState(0);
  const [pmrTimer, setPmrTimer] = useState(15);
  const [isPmrActive, setIsPmrActive] = useState(false);
  const pmrSteps = [
    { area: 'Shoulders & Neck', action: 'Raise shoulders high to ears for 5s... then drop completely.' },
    { area: 'Jaw & Face', action: 'Unclench jaw, let tongue rest flat, smooth your forehead.' },
    { area: 'Hands & Arms', action: 'Squeeze tight fists for 4s... then release fingers loose and open.' },
    { area: 'Stomach & Belly', action: 'Gently tense core... then let your belly soften completely outward.' },
  ];

  // Reset inactive loops on tool switch
  useEffect(() => {
    setIsSighActive(false);
    setSighPhase('ready');
    setIsBoxActive(false);
    setIs478Active(false);
    setPhase478('ready');
    setIsStonePressed(false);
    setIsPmrActive(false);
    setIsTappingActive(false);
  }, [activeTool]);

  // Subscribe to audio engine state
  useEffect(() => {
    const unsub = soundEngine.subscribe((st) => {
      setIsPlayingTone(st.isPlayingTone);
      setIsPlayingBrownNoise(st.isPlayingBrownNoise);
    });
    return unsub;
  }, []);

  // 1. Bilateral Tapping (Butterfly Hug) Loop (~1 Hz cadence: alternating every 500ms)
  useEffect(() => {
    if (!isTappingActive) return;

    let side: 'left' | 'right' = 'left';
    const interval = window.setInterval(() => {
      side = side === 'left' ? 'right' : 'left';
      setActiveTapSide(side);
      setTapRounds((r) => r + 1);

      if (isTapSoundEnabled) {
        soundEngine.playBilateralTapChime(side);
      }
    }, 550);

    return () => clearInterval(interval);
  }, [isTappingActive, isTapSoundEnabled]);

  // Bilateral Tapping Countdown Timer
  useEffect(() => {
    if (!isTappingActive) return;

    const timer = window.setInterval(() => {
      setTappingSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsTappingActive(false);
          soundEngine.playSingingBowlChime(216);
          storageService.addSessionHistory({
            title: 'Bilateral Tapping',
            type: 'stress',
            durationSeconds: tappingDuration,
          });
          return tappingDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTappingActive, tappingDuration]);

  // Brown Noise Countdown Timer
  useEffect(() => {
    if (!isPlayingBrownNoise || !brownNoiseSecondsRemaining) return;

    const interval = window.setInterval(() => {
      setBrownNoiseSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          soundEngine.stopBrownNoise();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayingBrownNoise, brownNoiseSecondsRemaining]);

  // SOS Cycle
  useEffect(() => {
    if (activeTool !== 'sos_calm' || !isSosActive) return;
    let t1: number, t2: number;

    const runSos = () => {
      setSosPhase('breathe_in');
      t1 = window.setTimeout(() => {
        setSosPhase('hold');
        t2 = window.setTimeout(() => {
          setSosPhase('breathe_out');
          setSosMessageIndex((i) => (i + 1) % sosMessages.length);
        }, 1500);
      }, 3500);
    };

    runSos();
    const interval = window.setInterval(runSos, 11000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [activeTool, isSosActive]);

  // Physiological Sigh Cycle
  useEffect(() => {
    if (!isSighActive) {
      setSighPhase('ready');
      return;
    }

    let t1: number, t2: number, t3: number;

    const runSigh = () => {
      setSighPhase('inhale1');
      soundEngine.playBreathChime(false);

      t1 = window.setTimeout(() => {
        setSighPhase('inhale2');

        t2 = window.setTimeout(() => {
          setSighPhase('exhale');
          soundEngine.playBreathChime(true);

          t3 = window.setTimeout(() => {
            setSighRounds((r) => r + 1);
            runSigh();
          }, 6000);
        }, 1300);
      }, 2700);
    };

    runSigh();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSighActive]);

  // Box Breathing Cycle
  useEffect(() => {
    if (!isBoxActive) {
      setBoxCount(4);
      setBoxSide('top');
      return;
    }

    const interval = window.setInterval(() => {
      setBoxCount((prev) => {
        if (prev <= 1) {
          setBoxSide((currentSide) => {
            if (currentSide === 'top') return 'right';
            if (currentSide === 'right') return 'bottom';
            if (currentSide === 'bottom') return 'left';
            setBoxRounds((r) => r + 1);
            return 'top';
          });
          soundEngine.playTapFeedback();
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBoxActive]);

  // 4-7-8 Breath Cycle
  useEffect(() => {
    if (!is478Active) {
      setPhase478('ready');
      setCount478(4);
      return;
    }

    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let currentSeconds = 4;
    setPhase478('inhale');
    setCount478(4);

    const interval = window.setInterval(() => {
      currentSeconds -= 1;

      if (currentSeconds <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          currentSeconds = 7;
          setPhase478('hold');
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          currentSeconds = 8;
          setPhase478('exhale');
          soundEngine.playBreathChime(true);
        } else {
          currentPhase = 'inhale';
          currentSeconds = 4;
          setPhase478('inhale');
          soundEngine.playBreathChime(false);
        }
      }
      setCount478(currentSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [is478Active]);

  // PMR 60s Timer
  useEffect(() => {
    if (!isPmrActive) return;
    const interval = window.setInterval(() => {
      setPmrTimer((t) => {
        if (t <= 1) {
          setPmrStep((s) => {
            if (s >= pmrSteps.length - 1) {
              setIsPmrActive(false);
              storageService.addSessionHistory({
                title: '60s Tension Release',
                type: 'stress',
                durationSeconds: 60,
              });
              return 0;
            }
            soundEngine.playTapFeedback();
            return s + 1;
          });
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPmrActive]);

  // Calming Stone Press Handlers
  const handleStonePressStart = () => {
    setIsStonePressed(true);
    soundEngine.startStoneHum();
    stoneIntervalRef.current = window.setInterval(() => {
      setStoneSeconds((s) => s + 1);
    }, 1000);
  };

  const handleStonePressEnd = () => {
    setIsStonePressed(false);
    soundEngine.stopStoneHum();
    if (stoneIntervalRef.current) {
      clearInterval(stoneIntervalRef.current);
      stoneIntervalRef.current = null;
    }
  };

  // Worry Dissolve Handler
  const handleDissolveWorry = () => {
    if (!worryInput.trim()) return;
    setIsDissolving(true);
    soundEngine.playSingingBowlChime(240);

    setTimeout(() => {
      setIsDissolving(false);
      setIsDissolved(true);
      setWorryInput('');
      storageService.addSessionHistory({
        title: 'Released Worry',
        type: 'stress',
        durationSeconds: 60,
      });
    }, 2400);
  };

  // Circle of Control Actions
  const handleAddControlItem = (type: 'within' | 'outside') => {
    if (!controlInput.trim()) return;
    const newItem: ControlItem = {
      id: 'c_' + Date.now(),
      text: controlInput.trim(),
      type,
    };
    setControlItems((prev) => [newItem, ...prev]);
    setControlInput('');
    soundEngine.playTapFeedback();
  };

  const handleDissolveOutsideItem = (id: string) => {
    setDissolvingControlId(id);
    soundEngine.playSingingBowlChime(240);
    setTimeout(() => {
      setControlItems((prev) => prev.filter((item) => item.id !== id));
      setDissolvingControlId(null);
    }, 1200);
  };

  // Brown Noise Toggle
  const handleToggleBrownNoise = () => {
    if (isPlayingBrownNoise) {
      soundEngine.stopBrownNoise();
      setBrownNoiseSecondsRemaining(null);
    } else {
      soundEngine.startBrownNoise(brownNoiseTimerMinutes);
      if (brownNoiseTimerMinutes) {
        setBrownNoiseSecondsRemaining(brownNoiseTimerMinutes * 60);
      }
    }
  };

  // Perspective Reframing Save
  const handleSavePerspective = () => {
    const summary = `10/10/10 Reflection on: "${perspectiveStressor || 'Current Stressor'}"\n10 Days: ${ans10Days || 'N/A'}\n10 Months: ${ans10Months || 'N/A'}\n10 Years: ${ans10Years || 'N/A'}`;
    storageService.addJournalEntry('10/10/10 Perspective', summary);
    setIsPerspectiveSaved(true);
    soundEngine.playSingingBowlChime(216);
    setTimeout(() => setIsPerspectiveSaved(false), 3000);
  };

  const filteredTools = STRESS_TOOLS_CATALOG.filter((tool) => {
    if (selectedCategory === 'all') return true;
    return tool.category === selectedCategory;
  });

  const withinItems = controlItems.filter((i) => i.type === 'within');
  const outsideItems = controlItems.filter((i) => i.type === 'outside');

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pb-28 sm:pb-20 max-w-xl mx-auto px-4 space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl text-[#827666] hover:text-[#244C3A]"
              aria-label="Back to sanctuary"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#244C3A]">
              Stress Relief
            </h1>
            <p className="text-xs text-[#827666]">
              Targeted tools to calm your nervous system.
            </p>
          </div>
        </div>

        {/* Global Sound Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const playing = soundEngine.toggle432HzTone();
              setIsPlayingTone(playing);
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              isPlayingTone
                ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A]'
                : 'bg-[#EDE9DC]/60 text-[#827666] border-[#91A88C]/30 hover:text-[#244C3A]'
            }`}
            title="Toggle 432Hz calming tone"
          >
            {isPlayingTone ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline font-mono">432Hz</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'instant', 'breath', 'physical', 'mental'] as StressCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-[#244C3A] text-[#F7F5EE]'
                : 'bg-[#EDE9DC]/70 text-[#827666] hover:text-[#27332C]'
            }`}
          >
            {cat === 'all' ? 'All tools' : cat}
          </button>
        ))}
      </div>

      {/* Active Interactive Exercise Board */}
      <div className="rounded-3xl bg-white border border-[#91A88C]/30 shadow-sm overflow-hidden p-5 transition-all min-h-[380px] flex flex-col justify-between">
        {/* =========================================
            FEATURE 0: TEDDY BEAR STRESS BUSTER
            ========================================= */}
        {activeTool === 'teddy_bop' && (
          <TeddyStressBuster compact={false} />
        )}

        {/* =========================================
            FEATURE 1: BILATERAL TAPPING (BUTTERFLY HUG)
            ========================================= */}
        {activeTool === 'bilateral_tapping' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-2 space-y-5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A7C59] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <Activity size={12} />
                Bilateral Stimulation
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Bilateral Tapping (Butterfly Hug)
              </h2>
              <p className="text-xs text-[#827666] max-w-sm mx-auto leading-relaxed">
                Cross your arms over your chest and tap alternately with the rhythm to ground your nervous system.
              </p>
            </div>

            {/* Alternating Left-Right Pacer Graphic */}
            <div className="w-full max-w-xs py-4 flex items-center justify-between px-4">
              {/* Left Pacer Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    activeTapSide === 'left' && isTappingActive
                      ? 'bg-[#244C3A] text-[#F7F5EE] scale-110 shadow-lg ring-8 ring-[#91A88C]/35'
                      : 'bg-[#EDE9DC]/70 text-[#827666] scale-95 border-2 border-[#91A88C]/30'
                  }`}
                >
                  <span className="font-serif text-sm font-semibold">LEFT</span>
                  <span className="text-[10px] opacity-80">Tap hand</span>
                </div>
              </div>

              {/* Center Rhythm Wave Indicator */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-12 bg-[#EDE9DC] rounded-full overflow-hidden relative">
                  <div
                    className={`w-full bg-[#244C3A] transition-all duration-300 ${
                      activeTapSide === 'left' ? 'h-full top-0' : 'h-1/2 bottom-0'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#827666] mt-2">~1 Hz</span>
              </div>

              {/* Right Pacer Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    activeTapSide === 'right' && isTappingActive
                      ? 'bg-[#244C3A] text-[#F7F5EE] scale-110 shadow-lg ring-8 ring-[#91A88C]/35'
                      : 'bg-[#EDE9DC]/70 text-[#827666] scale-95 border-2 border-[#91A88C]/30'
                  }`}
                >
                  <span className="font-serif text-sm font-semibold">RIGHT</span>
                  <span className="text-[10px] opacity-80">Tap hand</span>
                </div>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="space-y-3 w-full max-w-sm">
              <div className="flex items-center justify-between text-xs text-[#827666] px-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span className="font-mono text-sm font-semibold text-[#244C3A]">
                    {formatTimer(tappingSecondsRemaining)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setTappingDuration(60);
                      setTappingSecondsRemaining(60);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      tappingDuration === 60
                        ? 'bg-[#244C3A] text-[#F7F5EE]'
                        : 'bg-[#EDE9DC] text-[#827666]'
                    }`}
                  >
                    1 min
                  </button>
                  <button
                    onClick={() => {
                      setTappingDuration(180);
                      setTappingSecondsRemaining(180);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      tappingDuration === 180
                        ? 'bg-[#244C3A] text-[#F7F5EE]'
                        : 'bg-[#EDE9DC] text-[#827666]'
                    }`}
                  >
                    3 min
                  </button>

                  <button
                    onClick={() => setIsTapSoundEnabled(!isTapSoundEnabled)}
                    className={`p-1 rounded-full text-[11px] ml-1 ${
                      isTapSoundEnabled ? 'text-[#244C3A]' : 'text-[#827666] line-through'
                    }`}
                    title="Toggle audio tap chimes"
                  >
                    {isTapSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsTappingActive(!isTappingActive)}
                  className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-md flex items-center gap-1.5 transition-all"
                >
                  {isTappingActive ? <Pause size={14} /> : <Play size={14} fill="#F7F5EE" />}
                  <span>{isTappingActive ? 'Pause Tapping' : 'Start Butterfly Hug'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsTappingActive(false);
                    setTappingSecondsRemaining(tappingDuration);
                  }}
                  className="p-2.5 rounded-full bg-[#EDE9DC] hover:bg-[#91A88C]/30 text-[#827666]"
                  aria-label="Reset timer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            FEATURE 2: CIRCLE OF CONTROL
            ========================================= */}
        {activeTool === 'circle_of_control' && (
          <div className="flex flex-col flex-1 py-1 space-y-4">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#244C3A] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                Mental Clarity
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Circle of Control
              </h2>
              <p className="text-xs text-[#827666] max-w-sm mx-auto">
                Sort what is yours to hold, and dissolve what is not.
              </p>
            </div>

            {/* Stressor Input Form */}
            <div className="p-3 rounded-2xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-2">
              <input
                type="text"
                value={controlInput}
                onChange={(e) => setControlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddControlItem('within');
                }}
                placeholder="What stressor is on your mind? (e.g. traffic, boss's mood, my focus)"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#91A88C]/40 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
              />

              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-[11px] text-[#827666] mr-auto hidden sm:inline">Add to:</span>
                <button
                  onClick={() => handleAddControlItem('within')}
                  disabled={!controlInput.trim()}
                  className="px-3 py-1.5 rounded-full bg-[#244C3A] disabled:opacity-40 hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium flex items-center gap-1 shadow-sm"
                >
                  <Plus size={12} />
                  <span>Within My Control</span>
                </button>
                <button
                  onClick={() => handleAddControlItem('outside')}
                  disabled={!controlInput.trim()}
                  className="px-3 py-1.5 rounded-full bg-[#827666] disabled:opacity-40 hover:bg-[#6c6152] text-[#F7F5EE] text-xs font-medium flex items-center gap-1 shadow-sm"
                >
                  <Plus size={12} />
                  <span>Outside My Control</span>
                </button>
              </div>
            </div>

            {/* Two-Column Interactive Sorter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {/* Column 1: Within My Control */}
              <div className="p-3.5 rounded-2xl bg-[#EDE9DC]/40 border border-[#244C3A]/25 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-1 border-b border-[#91A88C]/20">
                  <span className="text-xs font-semibold text-[#244C3A] flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Within My Control
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-[#244C3A]">
                    {withinItems.length}
                  </span>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 flex-1">
                  {withinItems.length === 0 ? (
                    <p className="text-[11px] text-[#827666] italic text-center py-4">
                      No items yet. What can you take mindful action on?
                    </p>
                  ) : (
                    withinItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-white border border-[#91A88C]/30 text-xs flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <span className="text-[#27332C]">{item.text}</span>
                        <button
                          onClick={() => setControlItems((prev) => prev.filter((i) => i.id !== item.id))}
                          className="text-[#827666] hover:text-red-700 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Outside My Control */}
              <div className="p-3.5 rounded-2xl bg-[#EDE9DC]/40 border border-[#827666]/30 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-1 border-b border-[#91A88C]/20">
                  <span className="text-xs font-semibold text-[#827666] flex items-center gap-1">
                    <Sparkles size={13} />
                    Outside My Control
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-[#827666]">
                    {outsideItems.length}
                  </span>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 flex-1">
                  {outsideItems.length === 0 ? (
                    <p className="text-[11px] text-[#827666] italic text-center py-4">
                      Nothing here right now. All outside weights let go.
                    </p>
                  ) : (
                    outsideItems.map((item) => {
                      const isDissolving = dissolvingControlId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`p-2 rounded-xl bg-white/90 border border-[#91A88C]/30 text-xs flex items-center justify-between gap-2 transition-all duration-700 ${
                            isDissolving ? 'opacity-0 scale-75 blur-md bg-amber-50' : 'opacity-100'
                          }`}
                        >
                          <span className="text-[#27332C] line-clamp-1">{item.text}</span>
                          <button
                            onClick={() => handleDissolveOutsideItem(item.id)}
                            className="px-2 py-0.5 rounded-full bg-[#EDE9DC] hover:bg-[#827666] hover:text-white text-[#827666] text-[10px] font-medium transition-colors shrink-0 flex items-center gap-1"
                            title="Let go of this stressor"
                          >
                            <Sparkles size={10} />
                            <span>Let Go</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            FEATURE 3: BROWN NOISE GENERATOR
            ========================================= */}
        {activeTool === 'brown_noise' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-2 space-y-5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B5B4D] uppercase tracking-wider bg-stone-100 px-2.5 py-0.5 rounded-full">
                <Waves size={12} />
                Acoustic Masking
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Brown Noise Generator
              </h2>
              <p className="text-xs text-[#827666] max-w-sm mx-auto">
                Velvety low-frequency acoustic rumble synthesized directly in your browser.
              </p>
            </div>

            {/* Sound Wave Graphic Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center my-1">
              {isPlayingBrownNoise && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-[#6B5B4D]/30 animate-ping opacity-35" />
                  <div className="absolute -inset-3 rounded-full border border-[#244C3A]/20 animate-pulse" />
                </>
              )}

              <button
                onClick={handleToggleBrownNoise}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-500 active:scale-95 ${
                  isPlayingBrownNoise
                    ? 'bg-[#244C3A] ring-8 ring-[#91A88C]/35 scale-105'
                    : 'bg-[#6B5B4D] hover:bg-[#594b3f]'
                }`}
              >
                {isPlayingBrownNoise ? <Waves size={36} className="animate-pulse" /> : <Play size={36} fill="#F7F5EE" />}
                <span className="text-xs font-semibold mt-2">
                  {isPlayingBrownNoise ? 'Playing Brown Noise' : 'Start Noise'}
                </span>
                <span className="text-[10px] opacity-80 font-mono">
                  {isPlayingBrownNoise ? 'Active' : 'Tap to play'}
                </span>
              </button>
            </div>

            {/* Volume & Sleep Timer Controls */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-3">
              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#827666]">
                  <span className="font-medium text-[#244C3A]">Rumble Volume</span>
                  <span className="font-mono">{Math.round(brownNoiseVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={brownNoiseVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setBrownNoiseVolume(val);
                    soundEngine.setBrownNoiseVolume(val);
                  }}
                  className="w-full accent-[#244C3A] h-1.5 bg-white rounded-lg cursor-pointer"
                />
              </div>

              {/* Sleep Timer Selector */}
              <div className="flex items-center justify-between pt-1 border-t border-[#91A88C]/20 text-xs">
                <span className="text-[11px] text-[#827666] flex items-center gap-1">
                  <Clock size={12} />
                  <span>Sleep timer:</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {[5, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setBrownNoiseTimerMinutes(mins);
                        if (isPlayingBrownNoise) {
                          setBrownNoiseSecondsRemaining(mins * 60);
                        }
                      }}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                        brownNoiseTimerMinutes === mins
                          ? 'bg-[#244C3A] text-white'
                          : 'bg-white text-[#827666] hover:text-[#244C3A]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setBrownNoiseTimerMinutes(null);
                      setBrownNoiseSecondsRemaining(null);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      brownNoiseTimerMinutes === null
                        ? 'bg-[#244C3A] text-white'
                        : 'bg-white text-[#827666] hover:text-[#244C3A]'
                    }`}
                  >
                    ∞
                  </button>
                </div>
              </div>

              {brownNoiseSecondsRemaining !== null && isPlayingBrownNoise && (
                <p className="text-[11px] font-mono text-[#244C3A] text-center font-medium">
                  Fading out in {formatTimer(brownNoiseSecondsRemaining)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            FEATURE 4: PERSPECTIVE 10/10/10 REFLECTION
            ========================================= */}
        {activeTool === 'perspective_101010' && (
          <div className="flex flex-col flex-1 py-1 space-y-4">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3D5A80] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                <Clock size={12} />
                Cognitive Reframing
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Perspective 10/10/10
              </h2>
              <p className="text-xs text-[#827666] max-w-sm mx-auto">
                Take a long lens on this stressful moment.
              </p>
            </div>

            {/* The Stressor Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#244C3A] block">
                Current Stressor
              </label>
              <input
                type="text"
                value={perspectiveStressor}
                onChange={(e) => setPerspectiveStressor(e.target.value)}
                placeholder="What situation is taking your energy right now?"
                className="w-full px-3 py-2 rounded-xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
              />
            </div>

            {/* 3 Step 10/10/10 Prompt Inputs */}
            <div className="space-y-3">
              {/* Question 1: 10 Days */}
              <div className="p-3 rounded-2xl bg-white border border-[#91A88C]/30 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-[#244C3A]">
                  1. Will this matter in 10 days?
                </span>
                <input
                  type="text"
                  value={ans10Days}
                  onChange={(e) => setAns10Days(e.target.value)}
                  placeholder="Probably just a small memory or solved by then..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#EDE9DC]/30 border border-[#91A88C]/20 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
                />
              </div>

              {/* Question 2: 10 Months */}
              <div className="p-3 rounded-2xl bg-white border border-[#91A88C]/30 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-[#244C3A]">
                  2. Will this matter in 10 months?
                </span>
                <input
                  type="text"
                  value={ans10Months}
                  onChange={(e) => setAns10Months(e.target.value)}
                  placeholder="A past chapter that taught me something..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#EDE9DC]/30 border border-[#91A88C]/20 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
                />
              </div>

              {/* Question 3: 10 Years */}
              <div className="p-3 rounded-2xl bg-white border border-[#91A88C]/30 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-[#244C3A]">
                  3. Will this matter in 10 years?
                </span>
                <input
                  type="text"
                  value={ans10Years}
                  onChange={(e) => setAns10Years(e.target.value)}
                  placeholder="Hardly a blip in the full scope of my life..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#EDE9DC]/30 border border-[#91A88C]/20 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
                />
              </div>
            </div>

            {/* Gentle Perspective Conclusion */}
            <div className="p-4 rounded-2xl bg-[#EDE9DC]/70 border border-[#91A88C]/30 text-center space-y-2">
              <p className="font-serif text-sm font-medium text-[#244C3A]">
                "Most things pass. Protect your peace today."
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSavePerspective}
                  disabled={!perspectiveStressor.trim() && !ans10Days.trim()}
                  className="px-4 py-1.5 rounded-full bg-[#244C3A] disabled:opacity-40 hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Check size={12} />
                  <span>{isPerspectiveSaved ? 'Saved to Notes' : 'Save Reflection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            EXISTING TOOLS: SOS, SIGH, BOX, ETC.
            ========================================= */}
        {activeTool === 'sos_calm' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D9534F] uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full">
                <ShieldAlert size={12} />
                Instant Anchor
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Take Refuge in This Breath
              </h2>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  sosPhase === 'breathe_in'
                    ? 'scale-110 bg-[#91A88C]/30'
                    : sosPhase === 'hold'
                    ? 'scale-105 bg-[#244C3A]/20'
                    : 'scale-90 bg-[#EDE9DC]'
                }`}
              />
              <div
                className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center text-white font-medium shadow-md transition-all duration-700 ${
                  sosPhase === 'breathe_in'
                    ? 'bg-[#244C3A] scale-105'
                    : sosPhase === 'hold'
                    ? 'bg-[#1D3E2F]'
                    : 'bg-[#3A604E] scale-95'
                }`}
              >
                <span className="text-base tracking-wide capitalize">
                  {sosPhase === 'breathe_in' && 'Breathe in'}
                  {sosPhase === 'hold' && 'Soft hold'}
                  {sosPhase === 'breathe_out' && 'Long exhale'}
                </span>
                <span className="text-[10px] opacity-80 mt-0.5">through lips</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#EDE9DC]/60 max-w-sm w-full">
              <p className="font-serif text-sm text-[#27332C] transition-opacity duration-500">
                "{sosMessages[sosMessageIndex]}"
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playSingingBowlChime(216);
                  storageService.addSessionHistory({
                    title: 'Instant SOS Calm',
                    type: 'stress',
                    durationSeconds: 60,
                  });
                }}
                className="px-4 py-2 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] text-[#244C3A] text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Bell size={13} />
                <span>Ring singing bowl</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. Physiological Sigh View */}
        {activeTool === 'sigh' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#244C3A] uppercase tracking-wider">
                Neurobiological Reset
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Physiological Sigh
              </h2>
              <p className="text-xs text-[#827666]">
                2 quick inhales by nose, 1 long sigh out by mouth.
              </p>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed border-[#91A88C] transition-transform duration-700 ${
                  sighPhase === 'inhale1'
                    ? 'scale-100'
                    : sighPhase === 'inhale2'
                    ? 'scale-115 border-[#244C3A]'
                    : sighPhase === 'exhale'
                    ? 'scale-75 opacity-40'
                    : 'scale-90'
                }`}
              />
              <div
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all ${
                  sighPhase === 'inhale1'
                    ? 'bg-[#244C3A] scale-100 duration-[2700ms]'
                    : sighPhase === 'inhale2'
                    ? 'bg-[#193629] scale-110 duration-[1200ms]'
                    : sighPhase === 'exhale'
                    ? 'bg-[#91A88C] scale-75 duration-[6000ms]'
                    : 'bg-[#244C3A] scale-90'
                }`}
              >
                {sighPhase === 'ready' && <span className="text-sm font-medium">Ready</span>}
                {sighPhase === 'inhale1' && (
                  <>
                    <span className="text-sm font-medium">Inhale Deep</span>
                    <span className="text-[10px] opacity-80">(Nose)</span>
                  </>
                )}
                {sighPhase === 'inhale2' && (
                  <>
                    <span className="text-xs font-semibold">+ Top Off</span>
                    <span className="text-[10px] opacity-80">(Quick sniff)</span>
                  </>
                )}
                {sighPhase === 'exhale' && (
                  <>
                    <span className="text-sm font-medium">Slow Sigh</span>
                    <span className="text-[10px] opacity-80">(Mouth)</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-[#827666]">
              Completed rounds: <span className="font-semibold text-[#244C3A]">{sighRounds}</span> / 3
            </div>

            <div>
              {!isSighActive ? (
                <button
                  onClick={() => setIsSighActive(true)}
                  className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm transition-all"
                >
                  Start Sigh Exercise
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsSighActive(false);
                    storageService.addSessionHistory({
                      title: 'Physiological Sigh',
                      type: 'stress',
                      durationSeconds: sighRounds * 10 || 30,
                    });
                  }}
                  className="px-5 py-2 rounded-full border border-[#244C3A] text-[#244C3A] text-xs font-medium hover:bg-[#EDE9DC]"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        {/* 7. Box Breathing View */}
        {activeTool === 'box_breath' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#2E5A88] uppercase tracking-wider">
                4-4-4-4 Technique
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Box Breathing
              </h2>
              <p className="text-xs text-[#827666]">
                Equalized pacing to dissolve acute fight-or-flight arousal.
              </p>
            </div>

            <div className="relative w-40 h-40 border-4 border-[#EDE9DC] rounded-2xl flex items-center justify-center my-2">
              <div
                className={`absolute bg-[#244C3A] rounded transition-all duration-300 ${
                  boxSide === 'top'
                    ? 'top-0 left-0 right-0 h-1'
                    : boxSide === 'right'
                    ? 'top-0 right-0 bottom-0 w-1'
                    : boxSide === 'bottom'
                    ? 'bottom-0 left-0 right-0 h-1'
                    : 'top-0 left-0 bottom-0 w-1'
                }`}
              />

              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="font-mono text-3xl font-medium text-[#244C3A]">
                  {boxCount}
                </span>
                <span className="text-xs font-medium text-[#27332C] capitalize">
                  {boxSide === 'top' && 'Inhale'}
                  {boxSide === 'right' && 'Hold'}
                  {boxSide === 'bottom' && 'Exhale'}
                  {boxSide === 'left' && 'Rest'}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#827666]">
              Cycles: <span className="font-medium text-[#244C3A]">{boxRounds}</span>
            </div>

            <div>
              {!isBoxActive ? (
                <button
                  onClick={() => setIsBoxActive(true)}
                  className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm transition-all"
                >
                  Start Box Breath
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsBoxActive(false);
                    storageService.addSessionHistory({
                      title: 'Box Breathing',
                      type: 'stress',
                      durationSeconds: boxRounds * 16 || 30,
                    });
                  }}
                  className="px-5 py-2 rounded-full border border-[#244C3A] text-[#244C3A] text-xs font-medium"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        {/* 8. 4-7-8 Deep Rest View */}
        {activeTool === 'breath_478' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#3D5A80] uppercase tracking-wider">
                Parasympathetic Activation
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                4-7-8 Deep Rest
              </h2>
              <p className="text-xs text-[#827666]">
                Lengthened exhale signals heart rate deceleration.
              </p>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-md transition-all duration-1000 ${
                  phase478 === 'inhale'
                    ? 'bg-[#244C3A] scale-110'
                    : phase478 === 'hold'
                    ? 'bg-[#2E5A88] scale-105'
                    : phase478 === 'exhale'
                    ? 'bg-[#91A88C] scale-90'
                    : 'bg-[#827666]'
                }`}
              >
                <span className="font-mono text-3xl font-semibold">{count478}</span>
                <span className="text-xs font-medium uppercase tracking-wider mt-0.5">
                  {phase478}
                </span>
              </div>
            </div>

            <div>
              {!is478Active ? (
                <button
                  onClick={() => setIs478Active(true)}
                  className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm"
                >
                  Start 4-7-8 Practice
                </button>
              ) : (
                <button
                  onClick={() => setIs478Active(false)}
                  className="px-5 py-2 rounded-full border border-[#244C3A] text-[#244C3A] text-xs font-medium"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        {/* 9. Sensory Touchstone View */}
        {activeTool === 'calming_stone' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#827666] uppercase tracking-wider">
                Tactile Sensory Anchor
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Calming Touchstone
              </h2>
              <p className="text-xs text-[#827666]">
                Press and hold with your finger or mouse.
              </p>
            </div>

            <div className="relative py-4">
              {isStonePressed && (
                <div className="absolute inset-0 -m-6 rounded-full bg-[#91A88C]/30 animate-ping opacity-60" />
              )}
              <button
                onMouseDown={handleStonePressStart}
                onMouseUp={handleStonePressEnd}
                onMouseLeave={handleStonePressEnd}
                onTouchStart={handleStonePressStart}
                onTouchEnd={handleStonePressEnd}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-xl select-none active:scale-95 ${
                  isStonePressed
                    ? 'bg-[#244C3A] text-[#F7F5EE] ring-8 ring-[#91A88C]/40'
                    : 'bg-[#EDE9DC] text-[#244C3A] border-4 border-[#91A88C]/40'
                }`}
              >
                <Fingerprint size={42} className={isStonePressed ? 'scale-110' : ''} />
                <span className="text-xs font-medium mt-1">
                  {isStonePressed ? 'Holding...' : 'Hold Stone'}
                </span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#EDE9DC]/50 w-full max-w-xs">
              <p className="font-mono text-sm font-semibold text-[#244C3A]">
                {stoneSeconds} seconds held
              </p>
              <p className="text-[11px] text-[#827666] mt-0.5">
                {stoneSeconds > 10 ? 'Nervous system slowing...' : 'Keep holding to settle'}
              </p>
            </div>
          </div>
        )}

        {/* 10. Worry Dissolver View */}
        {activeTool === 'worry_dissolve' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#6B4C9A] uppercase tracking-wider">
                Cognitive De-Centering
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                Release a Thought
              </h2>
              <p className="text-xs text-[#827666]">
                Name what is troubling you, then let it dissolve.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              {!isDissolved ? (
                <div
                  className={`relative transition-all duration-1000 ${
                    isDissolving ? 'opacity-0 scale-75 blur-md' : 'opacity-100'
                  }`}
                >
                  <textarea
                    rows={3}
                    value={worryInput}
                    onChange={(e) => setWorryInput(e.target.value)}
                    placeholder="Type the worry, fear, or intrusive thought here..."
                    className="w-full p-3.5 rounded-2xl bg-[#EDE9DC]/40 border border-[#91A88C]/40 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A] resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleDissolveWorry}
                      disabled={!worryInput.trim() || isDissolving}
                      className="px-5 py-2 rounded-full bg-[#244C3A] hover:bg-[#193629] disabled:opacity-40 text-[#F7F5EE] text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles size={13} />
                      <span>{isDissolving ? 'Dissolving...' : 'Let Go'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-[#EDE9DC]/60 space-y-3 text-center animate-in fade-in duration-500">
                  <div className="w-10 h-10 rounded-full bg-[#244C3A] text-white flex items-center justify-center mx-auto">
                    <Check size={18} />
                  </div>
                  <h3 className="font-serif text-base font-medium text-[#244C3A]">
                    Thought Dissolved
                  </h3>
                  <p className="text-xs text-[#827666]">
                    You are not your thoughts. You are the peaceful awareness behind them.
                  </p>
                  <button
                    onClick={() => setIsDissolved(false)}
                    className="mt-2 px-4 py-1.5 rounded-full border border-[#244C3A] text-[#244C3A] text-xs font-medium"
                  >
                    Release another
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 11. Grounding 5-4-3-2-1 View */}
        {activeTool === 'grounding_54321' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#8C5E32] uppercase tracking-wider">
                Sensory Anchoring
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                5-4-3-2-1 Grounding
              </h2>
            </div>

            <div className="w-full max-w-sm p-5 rounded-3xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-[#244C3A]">
                  {groundingList[groundingStep].num}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#244C3A] text-white">
                  {groundingList[groundingStep].label}
                </span>
              </div>
              <p className="font-serif text-base text-[#27332C]">
                {groundingList[groundingStep].prompt}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {groundingList.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === groundingStep
                      ? 'bg-[#244C3A] scale-125'
                      : i < groundingStep
                      ? 'bg-[#91A88C]'
                      : 'bg-[#EDE9DC]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playTapFeedback();
                  if (groundingStep < groundingList.length - 1) {
                    setGroundingStep((s) => s + 1);
                  } else {
                    storageService.addSessionHistory({
                      title: '5-4-3-2-1 Grounding',
                      type: 'stress',
                      durationSeconds: 120,
                    });
                    setGroundingStep(0);
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm"
              >
                {groundingStep < groundingList.length - 1 ? 'Notice & Continue' : 'Finish Grounding'}
              </button>
            </div>
          </div>
        )}

        {/* 12. 60s Tension Release PMR View */}
        {activeTool === 'body_detense' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#4F772D] uppercase tracking-wider">
                Progressive Muscle Relaxation
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                60-Second Tension Scan
              </h2>
            </div>

            <div className="w-full max-w-sm p-5 rounded-3xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#244C3A]">
                  Step {pmrStep + 1} of 4: {pmrSteps[pmrStep].area}
                </span>
                <span className="font-mono font-medium text-[#827666]">{pmrTimer}s</span>
              </div>
              <p className="font-serif text-sm text-[#27332C]">
                {pmrSteps[pmrStep].action}
              </p>
            </div>

            <div>
              {!isPmrActive ? (
                <button
                  onClick={() => setIsPmrActive(true)}
                  className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm"
                >
                  Start Scan
                </button>
              ) : (
                <button
                  onClick={() => setIsPmrActive(false)}
                  className="px-5 py-2 rounded-full border border-[#244C3A] text-[#244C3A] text-xs font-medium"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        {/* 13. 432Hz Calm Frequency View */}
        {activeTool === 'sound_resonance' && (
          <div className="flex flex-col items-center justify-between text-center flex-1 py-3 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#1F7A8C] uppercase tracking-wider">
                Acoustic Frequency
              </span>
              <h2 className="font-serif text-xl font-medium text-[#244C3A]">
                432Hz Restorative Tone
              </h2>
              <p className="text-xs text-[#827666]">
                Mathematical harmonic tuning designed to ease cranial tension.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const playing = soundEngine.toggle432HzTone();
                  setIsPlayingTone(playing);
                }}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-md ${
                  isPlayingTone
                    ? 'bg-[#244C3A] text-[#F7F5EE] ring-8 ring-[#91A88C]/30 animate-pulse'
                    : 'bg-[#EDE9DC] text-[#244C3A] hover:bg-[#EDE9DC]/80'
                }`}
              >
                {isPlayingTone ? <Volume2 size={36} /> : <VolumeX size={36} />}
                <span className="text-xs font-medium mt-1">
                  {isPlayingTone ? 'Tone On' : 'Play 432Hz'}
                </span>
              </button>

              <button
                onClick={() => soundEngine.playSingingBowlChime(216)}
                className="block mx-auto px-4 py-1.5 rounded-full bg-[#EDE9DC]/80 text-[#244C3A] text-xs font-medium hover:bg-[#EDE9DC]"
              >
                Ring Singing Bowl Bell
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of All Stress Management Tools */}
      <section className="space-y-2.5">
        <h3 className="font-serif text-base font-medium text-[#244C3A]">
          Explore All Stress Tools ({filteredTools.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredTools.map((tool) => {
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  soundEngine.playTapFeedback();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#EDE9DC] border-[#244C3A] ring-1 ring-[#244C3A]'
                    : 'bg-white/80 hover:bg-[#EDE9DC]/60 border-[#91A88C]/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-sm font-medium text-[#244C3A]">
                      {tool.title}
                    </span>
                    {tool.id === 'sos_calm' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-semibold">
                        SOS
                      </span>
                    )}
                    {(tool.id === 'bilateral_tapping' ||
                      tool.id === 'circle_of_control' ||
                      tool.id === 'brown_noise' ||
                      tool.id === 'perspective_101010') && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        Interactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#827666] mt-0.5 line-clamp-1">
                    {tool.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#827666] bg-[#EDE9DC]/80 px-2 py-0.5 rounded-full shrink-0">
                  {tool.durationText}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
