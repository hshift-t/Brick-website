import appIcon from '../assets/icon.png';

export function AppIcon({ size = 84, className = '' }) {
  return (
    <div
      className={`app-icon ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={appIcon} alt="" width={size} height={size} />
    </div>
  );
}
