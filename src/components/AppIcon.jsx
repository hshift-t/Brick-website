import { useId } from 'react';

export function AppIcon({ size = 84, className = '' }) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div
      className={`app-icon ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
        <img
          src="/src/assets/icon.png"
          alt="App Icon"
          width={size}
          height={size}
        />
    </div>
  );
}
