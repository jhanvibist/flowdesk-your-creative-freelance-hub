interface WaveBackgroundProps {
  variant?: "hero" | "subtle" | "divider";
  className?: string;
}

export const WaveBackground = ({ variant = "hero", className = "" }: WaveBackgroundProps) => {
  if (variant === "divider") {
    return (
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`w-full h-16 ${className}`}
        aria-hidden="true"
      >
        <path
          d="M0,64 C240,112 480,16 720,48 C960,80 1200,32 1440,64 L1440,120 L0,120 Z"
          fill="hsl(var(--primary) / 0.06)"
        />
        <path
          d="M0,80 C240,40 480,96 720,72 C960,48 1200,88 1440,72 L1440,120 L0,120 Z"
          fill="hsl(var(--primary-glow) / 0.05)"
        />
      </svg>
    );
  }

  if (variant === "subtle") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="subtleWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(245 80% 60%)" stopOpacity="0.10" />
              <stop offset="50%" stopColor="hsl(195 65% 65%)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="hsl(170 60% 65%)" stopOpacity="0.10" />
            </linearGradient>
          </defs>
          <path
            d="M0,200 C360,120 720,280 1080,180 C1260,140 1380,200 1440,180 L1440,400 L0,400 Z"
            fill="url(#subtleWave)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="heroWave1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(245 80% 60%)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="hsl(170 60% 65%)" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="heroWave2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195 65% 65%)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(170 60% 70%)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="heroWave3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(170 60% 65%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(245 80% 60%)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 C240,180 480,420 720,320 C960,220 1200,380 1440,280 L1440,800 L0,800 Z"
          fill="url(#heroWave1)"
          className="animate-wave-flow"
          style={{ transformOrigin: "center" }}
        />
        <path
          d="M0,420 C320,360 640,500 960,440 C1120,410 1280,460 1440,420 L1440,800 L0,800 Z"
          fill="url(#heroWave2)"
        />
        <path
          d="M0,540 C360,480 720,620 1080,540 C1260,500 1380,560 1440,540 L1440,800 L0,800 Z"
          fill="url(#heroWave3)"
        />
      </svg>
    </div>
  );
};
