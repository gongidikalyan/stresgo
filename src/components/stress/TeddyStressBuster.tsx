import React, { useState, useRef } from 'react';
import { Sparkles, RotateCcw, Heart, Smile } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface FloatingHit {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface TeddyStressBusterProps {
  compact?: boolean;
  onClose?: () => void;
}

const HIT_PHRASES = [
  'Bop! ✨',
  'Squeak! 🧸',
  '-1 Stress 🍃',
  'Boop! 💕',
  'Whack! 💨',
  'Poof! 🌟',
  '+1 Calm 🌿',
  'Squish! 🌸',
];

const HIT_COLORS = ['#244C3A', '#D9534F', '#3D5A80', '#6B4C9A', '#D4A373', '#4F772D'];

export const TeddyStressBuster: React.FC<TeddyStressBusterProps> = ({ compact = false }) => {
  const [bopCount, setBopCount] = useState<number>(0);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [hitReaction, setHitReaction] = useState<'squint' | 'wink' | 'dizzy' | 'normal'>('normal');
  const [wobbleDirection, setWobbleDirection] = useState<'left' | 'right'>('left');
  const [floatingHits, setFloatingHits] = useState<FloatingHit[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const handleBop = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Sound & tactile feedback
    soundEngine.playTeddyBop();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch (_) {}
    }

    setBopCount((prev) => {
      const next = prev + 1;
      if (next % 15 === 0) {
        storageService.addSessionHistory({
          title: 'Teddy Bear Stress Bop',
          type: 'stress',
          durationSeconds: 30,
        });
      }
      return next;
    });

    // Wobble & squash physics
    const nextDir = wobbleDirection === 'left' ? 'right' : 'left';
    setWobbleDirection(nextDir);
    setIsHit(true);

    // Random silly facial reaction
    const reactions: ('squint' | 'wink' | 'dizzy')[] = ['squint', 'wink', 'dizzy'];
    const chosenReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setHitReaction(chosenReaction);

    setTimeout(() => {
      setIsHit(false);
      setHitReaction('normal');
    }, 280);

    // Floating text feedback near tap point
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? clientX - rect.left : 100;
    const y = rect ? clientY - rect.top : 80;

    const phrase = HIT_PHRASES[Math.floor(Math.random() * HIT_PHRASES.length)];
    const color = HIT_COLORS[Math.floor(Math.random() * HIT_COLORS.length)];

    const hitItem: FloatingHit = {
      id: nextId.current++,
      text: phrase,
      x: Math.max(30, Math.min(240, x)),
      y: Math.max(20, Math.min(220, y)),
      color,
    };

    setFloatingHits((prev) => [...prev.slice(-6), hitItem]);

    setTimeout(() => {
      setFloatingHits((prev) => prev.filter((item) => item.id !== hitItem.id));
    }, 900);
  };

  const getMilestoneMessage = (count: number) => {
    if (count === 0) return 'Tap or hit the teddy to release tension!';
    if (count < 10) return 'Gentle bops releasing tightness...';
    if (count < 25) return 'Feeling lighter! Keep tapping!';
    if (count < 50) return 'Stress bopped away! Deep breath.';
    return 'Ultimate Zen Master Teddy!';
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex flex-col items-center justify-between text-center overflow-hidden rounded-3xl ${
        compact ? 'p-4 bg-[#EDE9DC]/60 border border-[#91A88C]/30' : 'p-6 bg-white'
      }`}
    >
      {/* Header Info */}
      <div className="space-y-1 mb-2 z-10">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#D4A373] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            🧸 Stress Buster
          </span>
          <span className="text-xs font-mono font-bold text-[#244C3A] bg-[#EDE9DC] px-2 py-0.5 rounded-full">
            {bopCount} Bops
          </span>
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-medium text-[#244C3A]">
          Bop the Stress Teddy
        </h3>
        <p className="text-xs text-[#827666] max-w-xs mx-auto">
          {getMilestoneMessage(bopCount)}
        </p>
      </div>

      {/* Interactive Cartoon Teddy Bear Visual */}
      <div
        onClick={handleBop}
        onTouchStart={handleBop}
        className="relative cursor-pointer my-3 touch-manipulation active:scale-95 transition-transform"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        title="Tap to hit teddy and release stress!"
      >
        {/* Floating Hit Text & Stars */}
        {floatingHits.map((h) => (
          <div
            key={h.id}
            style={{
              left: `${h.x - 30}px`,
              top: `${h.y - 25}px`,
              color: h.color,
            }}
            className="absolute pointer-events-none z-30 font-serif font-bold text-sm sm:text-base animate-bounce drop-shadow-sm whitespace-nowrap"
          >
            {h.text}
          </div>
        ))}

        {/* The Animated Cartoon Teddy Bear SVG */}
        <div
          className={`w-44 h-48 sm:w-52 sm:h-56 transition-all duration-150 ease-out flex items-center justify-center ${
            isHit
              ? wobbleDirection === 'left'
                ? 'scale-x-110 scale-y-85 -rotate-8 translate-y-2'
                : 'scale-x-110 scale-y-85 rotate-8 translate-y-2'
              : 'hover:scale-105 scale-100'
          }`}
        >
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-md">
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="furGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2B17F" />
                <stop offset="100%" stopColor="#C48E59" />
              </linearGradient>
              <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FAD2E1" />
                <stop offset="100%" stopColor="#F7B2BD" />
              </linearGradient>
              <linearGradient id="tummyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF1D6" />
                <stop offset="100%" stopColor="#F5DFB8" />
              </linearGradient>
            </defs>

            {/* Teddy Left Ear */}
            <circle cx="50" cy="50" r="26" fill="url(#furGradient)" stroke="#8C5827" strokeWidth="3" />
            <circle cx="50" cy="50" r="15" fill="url(#innerEarGrad)" opacity="0.9" />

            {/* Teddy Right Ear */}
            <circle cx="150" cy="50" r="26" fill="url(#furGradient)" stroke="#8C5827" strokeWidth="3" />
            <circle cx="150" cy="50" r="15" fill="url(#innerEarGrad)" opacity="0.9" />

            {/* Teddy Body */}
            <ellipse cx="100" cy="148" rx="55" ry="50" fill="url(#furGradient)" stroke="#8C5827" strokeWidth="3.5" />

            {/* Soft Cream Tummy Patch */}
            <ellipse cx="100" cy="150" rx="36" ry="34" fill="url(#tummyGrad)" />

            {/* Tummy Heart Badge */}
            <path
              d="M100 138 C94 130, 84 134, 84 142 C84 150, 100 160, 100 160 C100 160, 116 150, 116 142 C116 134, 106 130, 100 138 Z"
              fill="#D9534F"
              opacity="0.85"
            />

            {/* Teddy Little Left Paw */}
            <ellipse
              cx={isHit ? 44 : 48}
              cy={isHit ? 122 : 138}
              rx="16"
              ry="14"
              fill="url(#furGradient)"
              stroke="#8C5827"
              strokeWidth="3"
              className="transition-all duration-150"
            />
            {/* Teddy Little Right Paw */}
            <ellipse
              cx={isHit ? 156 : 152}
              cy={isHit ? 122 : 138}
              rx="16"
              ry="14"
              fill="url(#furGradient)"
              stroke="#8C5827"
              strokeWidth="3"
              className="transition-all duration-150"
            />

            {/* Teddy Head */}
            <circle cx="100" cy="88" r="48" fill="url(#furGradient)" stroke="#8C5827" strokeWidth="3.5" />

            {/* Teddy Rosy Cheeks */}
            <ellipse cx="68" cy="100" rx="9" ry="6" fill="#FFB4A2" opacity="0.8" />
            <ellipse cx="132" cy="100" rx="9" ry="6" fill="#FFB4A2" opacity="0.8" />

            {/* Expressive Eyes */}
            {hitReaction === 'squint' ? (
              // Squinty happy eyes: > <
              <g stroke="#3D2314" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M72 82 L82 86 L72 90" />
                <path d="M128 82 L118 86 L128 90" />
              </g>
            ) : hitReaction === 'wink' ? (
              // Winking eye
              <g>
                <circle cx="78" cy="84" r="5" fill="#2B1810" />
                <circle cx="76" cy="82" r="1.8" fill="#FFFFFF" />
                <path d="M116 85 Q123 78 130 85" stroke="#2B1810" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            ) : hitReaction === 'dizzy' ? (
              // Cute dizzy spiral eyes
              <g stroke="#2B1810" strokeWidth="2.5" fill="none">
                <circle cx="78" cy="84" r="5.5" strokeDasharray="3 3" />
                <circle cx="122" cy="84" r="5.5" strokeDasharray="3 3" />
              </g>
            ) : (
              // Normal sweet big sparkling eyes
              <g>
                <circle cx="78" cy="84" r="6" fill="#2B1810" />
                <circle cx="76" cy="82" r="2.2" fill="#FFFFFF" />
                <circle cx="80" cy="86" r="1" fill="#FFFFFF" />

                <circle cx="122" cy="84" r="6" fill="#2B1810" />
                <circle cx="120" cy="82" r="2.2" fill="#FFFFFF" />
                <circle cx="124" cy="86" r="1" fill="#FFFFFF" />
              </g>
            )}

            {/* Teddy Snout / Muzzle */}
            <ellipse cx="100" cy="102" rx="20" ry="14" fill="url(#tummyGrad)" stroke="#8C5827" strokeWidth="2" />

            {/* Cute Little Brown Nose */}
            <ellipse cx="100" cy="97" rx="6.5" ry="4.5" fill="#4A2810" />

            {/* Mouth */}
            {isHit ? (
              // Surprised little open mouth :o
              <ellipse cx="100" cy="107" rx="4" ry="5" fill="#D9534F" />
            ) : (
              // Smiling happy mouth :3
              <path
                d="M93 104 Q100 110 100 104 Q100 110 107 104"
                stroke="#4A2810"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Bottom Hint & Reset Action */}
      <div className="flex items-center justify-between w-full max-w-xs px-2 pt-1">
        <span className="text-[11px] text-[#827666] flex items-center gap-1">
          <Sparkles size={12} className="text-amber-600" />
          <span>Tap fast to bop away stress!</span>
        </span>

        {bopCount > 0 && (
          <button
            onClick={() => setBopCount(0)}
            className="text-[10px] text-[#827666] hover:text-[#244C3A] flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
