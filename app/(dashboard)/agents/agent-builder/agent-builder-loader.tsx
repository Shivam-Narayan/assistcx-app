import React from "react";

interface AgentBuildingLoaderProps {
  progress?: number; // 0-100
  progressText?: string;
}

const AgentBuildingLoader: React.FC<AgentBuildingLoaderProps> = ({
  progress = 0,
  progressText = "Materializing Agent...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <svg width="140" height="140" viewBox="0 0 140 140" className="mb-4">
        {/* Hologram Base */}
        <ellipse
          cx="70"
          cy="120"
          rx="50"
          ry="8"
          fill="url(#hologramGradient)"
          opacity="0.6"
        />

        {/* Hologram Lines */}
        <g opacity="0.8">
          {[...Array(15)].map((_, i) => (
            <line
              key={i}
              x1="20"
              y1={30 + i * 6}
              x2="120"
              y2={30 + i * 6}
              stroke="#1F2937"
              strokeWidth="0.5"
              opacity="0.7"
            >
              <animate
                attributeName="opacity"
                values="0.2;0.8;0.2"
                dur="2s"
                begin={`${i * 0.1}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>

        {/* Robot Wireframe */}
        <g stroke="#111827" strokeWidth="1.5" fill="none">
          {/* Body */}
          <rect x="55" y="60" width="30" height="35" rx="5" opacity="0.9">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Head */}
          <rect x="58" y="35" width="24" height="25" rx="8" opacity="0.9">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="3s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Arms */}
          <rect x="40" y="65" width="12" height="20" rx="6" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="88" y="65" width="12" height="20" rx="6" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="2.5s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Legs */}
          <rect x="60" y="95" width="8" height="20" rx="4" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="72" y="95" width="8" height="20" rx="4" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.2"
              dur="2s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Hologram Eyes */}
        <circle cx="62" cy="45" r="3" fill="#1F2937" opacity="0.9">
          <animate
            attributeName="r"
            values="1;3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="78" cy="45" r="3" fill="#1F2937" opacity="0.9">
          <animate
            attributeName="r"
            values="1;3;1"
            dur="2s"
            begin="0.1s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Scanning Effect */}
        <rect x="20" y="25" width="100" height="2" fill="url(#scanGradient)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,-100;0,100;0,-100"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        <defs>
          <linearGradient
            id="hologramGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#111827" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#374151" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#111827" stopOpacity="0" />
            <stop offset="50%" stopColor="#1F2937" stopOpacity="1" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-gray-800 font-medium text-lg mb-4">
        {progressText}
      </div>

      {/* Progress Bar */}
      <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-gray-800 to-gray-700 h-2 rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        >
          {progress > 0 && (
            <div className="absolute right-0 top-0 w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      <div className="text-gray-700 text-sm font-mono">
        {Math.round(progress)}% Complete
      </div>
    </div>
  );
};

export default AgentBuildingLoader;
