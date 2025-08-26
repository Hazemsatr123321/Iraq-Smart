import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface DraggableAIAssistantButtonProps {
  onClick: () => void;
}

export const DraggableAIAssistantButton: React.FC<DraggableAIAssistantButtonProps> = ({ onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  const setInitialPosition = useCallback(() => {
    const buttonWidth = 56;
    const buttonHeight = 56;
    const margin = 20;
    const bottomMargin = window.innerWidth < 768 ? 80 : 20;

    setPosition({
      x: window.innerWidth - buttonWidth - margin,
      y: window.innerHeight - buttonHeight - bottomMargin,
    });
  }, []);

  useEffect(() => {
    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);
    return () => window.removeEventListener('resize', setInitialPosition);
  }, [setInitialPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only main mouse button
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    didMove.current = false;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !buttonRef.current) return;
    didMove.current = true;

    let newX = e.clientX - dragStartOffset.current.x;
    let newY = e.clientY - dragStartOffset.current.y;
    
    // Constrain within viewport
    const buttonWidth = buttonRef.current.offsetWidth;
    const buttonHeight = buttonRef.current.offsetHeight;
    const margin = 20;
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0;
    const bottomNavHeight = window.innerWidth < 768 ? 64 : 0; // 64px for bottom nav on mobile

    const minX = margin;
    const maxX = window.innerWidth - buttonWidth - margin;
    const minY = margin + safeAreaTop;
    const maxY = window.innerHeight - buttonHeight - bottomNavHeight - safeAreaBottom - margin;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Snap to the nearest side after a short delay to allow click event to process
    setTimeout(() => {
        if (!buttonRef.current) return;
        const snapToRight = position.x + buttonRef.current.offsetWidth / 2 > window.innerWidth / 2;
        const buttonWidth = buttonRef.current.offsetWidth;
        const margin = 20;
        const finalX = snapToRight ? window.innerWidth - buttonWidth - margin : margin;

        setPosition(prev => ({ ...prev, x: finalX }));
    }, 0);
  };
  
  const handleClick = (e: React.MouseEvent) => {
      if (didMove.current) {
          e.preventDefault();
          return;
      }
      onClick();
  };

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out',
      }}
      className="bg-brand-accent text-brand-primary rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-brand-accent/30 transform active:scale-95 border-4 border-brand-primary z-50 cursor-grab active:cursor-grabbing"
      aria-label="مساعد الذكاء الاصطناعي المتحرك"
    >
      <SparklesIcon className="w-7 h-7" />
    </button>
  );
};