/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showSlogan = true, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 32, title: 'text-lg', slogan: 'text-xs' },
    md: { icon: 42, title: 'text-xl', slogan: 'text-xs' },
    lg: { icon: 64, title: 'text-3xl', slogan: 'text-sm' },
    xl: { icon: 88, title: 'text-4xl', slogan: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Soil Time Emblem: Vibrant green tree nurturing and cradling the globe with rich soil strata */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332] p-1.5 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/20"
        style={{ width: current.icon, height: current.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Earth / Globe Base with Soil Horizons */}
          <circle cx="50" cy="56" r="34" fill="#3D5A80" opacity="0.35" />
          <circle cx="50" cy="56" r="34" stroke="#52B788" strokeWidth="2.5" />
          
          {/* Soil Layers in lower half of globe */}
          <path
            d="M 18 64 Q 50 78 82 64 A 34 34 0 0 1 18 64 Z"
            fill="#7F4F24"
            opacity="0.9"
          />
          <path
            d="M 22 72 Q 50 84 78 72 A 34 34 0 0 1 22 72 Z"
            fill="#582F0E"
          />

          {/* Continents & Healthy Vegetation on Globe */}
          <path
            d="M 32 46 Q 38 40 44 44 Q 48 48 42 54 Q 35 56 32 46 Z"
            fill="#74C69D"
          />
          <path
            d="M 58 48 Q 66 44 70 50 Q 68 56 62 58 Q 56 54 58 48 Z"
            fill="#74C69D"
          />

          {/* Tree Trunk & Roots cradling the earth */}
          <path
            d="M 47 48 C 47 38 44 32 38 24 C 44 26 48 30 50 36 C 52 30 56 26 62 24 C 56 32 53 38 53 48 Z"
            fill="#D8F3DC"
          />
          <path
            d="M 44 68 C 40 76 34 80 28 82 M 56 68 C 60 76 66 80 72 82 M 50 70 L 50 85"
            stroke="#DDB892"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Lush Green Foliage Crown holding the world */}
          <circle cx="50" cy="22" r="14" fill="#52B788" />
          <circle cx="38" cy="24" r="10" fill="#40916C" />
          <circle cx="62" cy="24" r="10" fill="#40916C" />
          <circle cx="50" cy="14" r="9" fill="#74C69D" />

          {/* Golden Sun Sprout Ray */}
          <circle cx="50" cy="20" r="3" fill="#FFF3B0" />
        </svg>
      </div>

      <div className="flex flex-col justify-center">
        <span className={`font-heading font-bold text-[#1B4332] tracking-tight leading-tight ${current.title}`}>
          Soil Time
        </span>
        {showSlogan && (
          <span className={`font-body font-medium text-[#7F4F24] tracking-wide ${current.slogan}`}>
            “ดินดี เกษตรกรยิ้มได้”
          </span>
        )}
      </div>
    </div>
  );
}
