import React from 'react';
import { NatureEnvironmentId } from '../../types';

interface NatureVisualProps {
  environmentId: NatureEnvironmentId | 'sanctuary_studio';
  className?: string;
  isAnimated?: boolean;
}

export const NatureVisual: React.FC<NatureVisualProps> = ({
  environmentId,
  className = '',
  isAnimated = true,
}) => {
  if (environmentId === 'forest') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#1B382B] ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12251D" />
              <stop offset="45%" stopColor="#244C3A" />
              <stop offset="85%" stopColor="#486D57" />
              <stop offset="100%" stopColor="#7E9B83" />
            </linearGradient>
            <linearGradient id="forestSunbeam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2D6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FFF2D6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1000" height="600" fill="url(#forestSky)" />

          {/* Sunbeams */}
          <polygon points="120,0 260,0 480,600 240,600" fill="url(#forestSunbeam)" />
          <polygon points="340,0 450,0 720,600 520,600" fill="url(#forestSunbeam)" />
          <polygon points="620,0 710,0 950,600 800,600" fill="url(#forestSunbeam)" />

          {/* Distant Ridge */}
          <path
            d="M0 380 Q200 320 400 350 T800 340 Q900 360 1000 380 L1000 600 L0 600 Z"
            fill="#1E3E30"
            opacity="0.85"
          />

          {/* Midground Trees Layer */}
          <g fill="#173527" opacity="0.95">
            <polygon points="100,260 150,380 50,380" />
            <polygon points="180,240 230,370 130,370" />
            <polygon points="310,250 370,400 250,400" />
            <polygon points="460,220 530,390 390,390" />
            <polygon points="600,240 670,400 530,400" />
            <polygon points="760,230 830,390 690,390" />
            <polygon points="880,250 950,410 810,410" />
          </g>

          {/* Foreground Deep Pines */}
          <g fill="#0E2118">
            <polygon points="60,160 140,480 -20,480" />
            <polygon points="220,130 320,510 120,510" />
            <polygon points="520,110 640,530 400,530" />
            <polygon points="780,140 890,520 670,520" />
            <polygon points="940,170 1040,540 840,540" />
          </g>

          {/* Forest Floor Mist & Ferns */}
          <ellipse cx="500" cy="560" rx="600" ry="80" fill="#244C3A" opacity="0.9" />
          <ellipse cx="300" cy="530" rx="400" ry="40" fill="#91A88C" opacity="0.25" />
          <ellipse cx="700" cy="540" rx="450" ry="45" fill="#91A88C" opacity="0.2" />
        </svg>
      </div>
    );
  }

  if (environmentId === 'ocean') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#1E3A4C] ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="oceanSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#152B38" />
              <stop offset="40%" stopColor="#2D546A" />
              <stop offset="70%" stopColor="#6C8F9E" />
              <stop offset="100%" stopColor="#E2D4C3" />
            </linearGradient>
            <linearGradient id="oceanWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24475A" />
              <stop offset="50%" stopColor="#1E3A4C" />
              <stop offset="100%" stopColor="#122530" />
            </linearGradient>
          </defs>

          {/* Dawn Sky */}
          <rect width="1000" height="600" fill="url(#oceanSky)" />

          {/* Soft Morning Sun Glow */}
          <circle cx="500" cy="340" r="140" fill="#FFF4E0" opacity="0.35" />
          <circle cx="500" cy="340" r="60" fill="#FFFDF8" opacity="0.75" />

          {/* Ocean Plane */}
          <rect y="340" width="1000" height="260" fill="url(#oceanWater)" />

          {/* Horizon Sun Reflection */}
          <polygon points="500,340 460,600 540,600" fill="#FFF4E0" opacity="0.15" />

          {/* Rolling Wave Swells */}
          <path
            d="M0 370 Q 250 365 500 370 T 1000 370 L 1000 600 L 0 600 Z"
            fill="#274D62"
            opacity="0.8"
          />
          <path
            d="M0 420 Q 300 410 600 420 T 1000 420 L 1000 600 L 0 600 Z"
            fill="#2D5870"
            opacity="0.75"
          />
          <path
            d="M0 480 Q 200 470 500 480 T 1000 485 L 1000 600 L 0 600 Z"
            fill="#34637D"
            opacity="0.8"
          />

          {/* Shoreline Foam & Sand Wash */}
          <path
            d="M0 535 Q 260 520 520 535 T 1000 530 L 1000 600 L 0 600 Z"
            fill="#EDE9DC"
            opacity="0.35"
          />
          <path
            d="M0 560 Q 300 550 600 560 T 1000 555 L 1000 600 L 0 600 Z"
            fill="#D5CBB9"
            opacity="0.6"
          />
        </svg>
      </div>
    );
  }

  if (environmentId === 'mountains') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#252F38] ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mtnSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B242C" />
              <stop offset="45%" stopColor="#313E4B" />
              <stop offset="85%" stopColor="#6C7C8A" />
              <stop offset="100%" stopColor="#C9D3D9" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1000" height="600" fill="url(#mtnSky)" />

          {/* Distant Snowy Peaks */}
          <polygon points="120,320 280,180 440,320" fill="#4B5B69" opacity="0.7" />
          <polygon points="280,180 320,230 250,230" fill="#E8EEF2" opacity="0.8" />

          <polygon points="400,340 560,160 720,340" fill="#3D4D5A" opacity="0.85" />
          <polygon points="560,160 610,220 520,220" fill="#E8EEF2" opacity="0.9" />

          <polygon points="680,360 840,190 980,360" fill="#425260" opacity="0.75" />
          <polygon points="840,190 880,240 810,240" fill="#E8EEF2" opacity="0.8" />

          {/* Drifting Clouds & Mist */}
          <ellipse cx="500" cy="300" rx="600" ry="50" fill="#FFFFFF" opacity="0.22" />
          <ellipse cx="300" cy="330" rx="400" ry="35" fill="#FFFFFF" opacity="0.28" />

          {/* Mid Ridge */}
          <path
            d="M-50 440 Q 250 330 500 390 T 1050 420 L 1050 600 L -50 600 Z"
            fill="#27343F"
          />

          {/* Foreground Alpine Slope */}
          <path
            d="M-50 500 Q 300 430 650 510 T 1050 490 L 1050 600 L -50 600 Z"
            fill="#1A242C"
          />

          {/* Alpine Pines on Ridge */}
          <g fill="#121A20">
            <polygon points="180,430 205,490 155,490" />
            <polygon points="240,410 270,480 210,480" />
            <polygon points="320,440 345,500 295,500" />
            <polygon points="720,460 750,530 690,530" />
            <polygon points="810,440 840,520 780,520" />
          </g>
        </svg>
      </div>
    );
  }

  if (environmentId === 'raingarden') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#1C332A] ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rainSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12231C" />
              <stop offset="60%" stopColor="#233E33" />
              <stop offset="100%" stopColor="#3C5E50" />
            </linearGradient>
          </defs>

          <rect width="1000" height="600" fill="url(#rainSky)" />

          {/* Garden Wall Texture */}
          <rect y="240" width="1000" height="360" fill="#182E25" opacity="0.9" />

          {/* Slanted Rain Droplet Streaks */}
          <g stroke="#C2D8CD" strokeWidth="1.2" opacity="0.32" strokeLinecap="round">
            <line x1="80" y1="20" x2="60" y2="100" />
            <line x1="220" y1="60" x2="200" y2="140" />
            <line x1="380" y1="10" x2="360" y2="90" />
            <line x1="520" y1="40" x2="500" y2="120" />
            <line x1="680" y1="15" x2="660" y2="95" />
            <line x1="840" y1="50" x2="820" y2="130" />
            <line x1="140" y1="180" x2="120" y2="260" />
            <line x1="320" y1="210" x2="300" y2="290" />
            <line x1="480" y1="170" x2="460" y2="250" />
            <line x1="640" y1="200" x2="620" y2="280" />
            <line x1="800" y1="190" x2="780" y2="270" />
            <line x1="940" y1="230" x2="920" y2="310" />
          </g>

          {/* Large Lush Leaves (Lotus / Monstera Foliage) */}
          <g fill="#244C3A" opacity="0.95">
            <ellipse cx="220" cy="460" rx="160" ry="85" transform="rotate(-15 220 460)" />
            <ellipse cx="440" cy="480" rx="180" ry="90" transform="rotate(8 440 480)" />
            <ellipse cx="760" cy="470" rx="190" ry="95" transform="rotate(-10 760 470)" />
          </g>

          <g fill="#173427">
            <ellipse cx="120" cy="520" rx="140" ry="75" transform="rotate(12 120 520)" />
            <ellipse cx="340" cy="540" rx="170" ry="80" transform="rotate(-6 340 540)" />
            <ellipse cx="620" cy="530" rx="190" ry="85" transform="rotate(14 620 530)" />
            <ellipse cx="890" cy="540" rx="160" ry="80" transform="rotate(-8 890 540)" />
          </g>

          {/* Glistening Droplets on Leaves */}
          <circle cx="210" cy="440" r="5" fill="#FFFFFF" opacity="0.75" />
          <circle cx="430" cy="460" r="6" fill="#FFFFFF" opacity="0.8" />
          <circle cx="750" cy="450" r="7" fill="#FFFFFF" opacity="0.85" />
          <circle cx="330" cy="520" r="5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="610" cy="510" r="6" fill="#FFFFFF" opacity="0.75" />
        </svg>
      </div>
    );
  }

  // Sanctuary Studio (Zen indoor sanctuary with linen mat & warm light)
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#244C3A] ${className}`}>
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="studioWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3E2F" />
            <stop offset="70%" stopColor="#274F3D" />
            <stop offset="100%" stopColor="#35614C" />
          </linearGradient>
          <linearGradient id="windowLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF7E6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFF7E6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <rect width="1000" height="600" fill="url(#studioWall)" />

        {/* Sunlight streaming through arched window */}
        <polygon points="280,0 420,0 800,600 460,600" fill="url(#windowLight)" />

        {/* Warm Timber Floor */}
        <rect y="440" width="1000" height="160" fill="#1A3327" />
        <line x1="0" y1="480" x2="1000" y2="480" stroke="#12241C" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="530" x2="1000" y2="530" stroke="#12241C" strokeWidth="2" opacity="0.5" />

        {/* Linen Yoga Mat */}
        <polygon points="360,460 640,460 740,580 260,580" fill="#EDE9DC" opacity="0.85" />
        {/* Meditation Cushion */}
        <ellipse cx="500" cy="495" rx="55" ry="22" fill="#91A88C" />
      </svg>
    </div>
  );
};
