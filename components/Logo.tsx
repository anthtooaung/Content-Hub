interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showWordmark = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Three overlapping circles — platform colors */}
        <circle cx="20" cy="18" r="14" fill="#111827" opacity="0.75" />
        <circle cx="32" cy="18" r="14" fill="#E1306C" opacity="0.75" />
        <circle cx="26" cy="30" r="14" fill="#1877F2" opacity="0.75" />
        {/* Center hub dot */}
        <circle cx="26" cy="22" r="4" fill="white" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-text-primary">
          Content Hub
        </span>
      )}
    </div>
  );
}
