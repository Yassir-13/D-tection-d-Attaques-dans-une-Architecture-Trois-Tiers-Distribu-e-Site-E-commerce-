import React, { useEffect, useRef } from 'react';

const SpotlightCard = ({
  children,
  className = '',
  width,
  height
}) => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / rect.width).toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / rect.height).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': 0,
      '--spread': 0,
      '--radius': '14',
      '--border': '2',
      '--backdrop': 'transparent', // No backdrop color, let the card manage its background
      '--backup-border': 'transparent',
      '--size': '250',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 1) * 1px)',
      '--spotlight-size': 'calc(var(--size, 250) * 1px)',
      // Black colors for spotlight
      '--hue': '0',
      '--saturation': '0',
      '--lightness': '0',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 0% 0% / 0.12), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none',
      transition: 'box-shadow 0.3s ease',
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow-black]::before,
    [data-glow-black]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      -webkit-mask: linear-gradient(white, white) padding-box, linear-gradient(white, white);
      -webkit-mask-composite: xor;
      mask: linear-gradient(white, white) padding-box, linear-gradient(white, white);
      mask-composite: exclude;
      z-index: 10;
    }
    
    [data-glow-black]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 40%, transparent 100%
      );
    }
    
    [data-glow-black]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 0% 0% / 0), transparent 100%
      );
    }
    
    [data-glow-black] [data-glow-inner] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow-black] > [data-glow-inner]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow-black
        style={getInlineStyles()}
        className={`
          rounded-[14px]
          relative 
          ${className}
        `}
      >
        <div ref={innerRef} data-glow-inner></div>
        {children}
      </div>
    </>
  );
};

export { SpotlightCard };
