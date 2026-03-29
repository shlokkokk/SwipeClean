import React, { useState, useRef, useCallback } from 'react';

interface TooltipProps {
  text: string;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
  fullWidth?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  shortcut,
  position = 'top',
  children,
  delay = 400,
  fullWidth = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  return (
    <div
      className={fullWidth ? 'tooltip-wrapper-block' : 'tooltip-wrapper-inline'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`tooltip-content tooltip-${position}`}>
          <span className="tooltip-text">{text}</span>
          {shortcut && (
            <span className="tooltip-shortcut">{shortcut}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
