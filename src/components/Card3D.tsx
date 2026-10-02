import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number;
  glowColor?: string;
  borderHighlight?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  onClick,
  maxTilt = 7,
  glowColor = 'rgba(16, 185, 129, 0.15)',
  borderHighlight = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative select-none"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-2xl transition-shadow ${
          isHovered
            ? 'shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.2)]'
            : 'shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)]'
        } ${className}`}
      >
        {/* Dynamic 3D Specular Sheen Glow */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle 280px at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 80%)`,
            }}
          />
        )}

        {/* 3D Top Bevel Reflection */}
        {borderHighlight && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
        )}

        {/* Card Content with 3D Depth */}
        <div style={{ transform: 'translateZ(12px)' }} className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
