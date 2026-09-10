import React from 'react';
import { createPortal } from 'react-dom';

export interface ProfileDisplayDragGhostProps {
  label: string;
  x: number;
  y: number;
  reducedMotion?: boolean;
}

const ProfileDisplayDragGhost: React.FC<ProfileDisplayDragGhostProps> = ({
  label,
  x,
  y,
  reducedMotion = false,
}) => {
  const ghost = (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 z-50 rounded-md border border-neutral-200 bg-white px-(--sp-row-x) py-1 text-xs font-medium text-neutral-900 opacity-[0.68] shadow-md ${
        reducedMotion ? '' : 'transition-transform duration-(--dur-press) ease-(--ease-press)'
      }`}
      style={{ transform: `translate3d(${x + 12}px, ${y}px, 0) translateY(-50%)` }}
    >
      {label}
    </div>
  );
  return createPortal(ghost, document.body);
};

export default ProfileDisplayDragGhost;
