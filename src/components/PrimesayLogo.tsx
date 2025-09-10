interface PrimesayLogoProps {
  className?: string;
}

export function PrimesayLogo({ className = "h-8 w-8" }: PrimesayLogoProps) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Dodecagon shape */}
        <polygon
          points="30,8 70,8 88,23 96,50 88,77 70,92 30,92 12,77 4,50 12,23"
          fill="currentColor"
          className="text-primary"
        />
        {/* Inner gradient effect */}
        <polygon
          points="35,15 65,15 80,27 85,50 80,73 65,85 35,85 20,73 15,50 20,27"
          fill="currentColor"
          className="text-primary/80"
        />
      </svg>
    </div>
  );
}