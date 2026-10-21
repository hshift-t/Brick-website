import { AppIcon } from './AppIcon';

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-14">
      <div className="rule mb-7" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AppIcon size={28} />
          <span className="text-sm" style={{ color: 'var(--dim)' }}>© 2026 Brick</span>
        </div>
        <p className="max-w-xl text-xs leading-relaxed" style={{ color: 'var(--dim)' }}>
          Download only content you own or have permission to save. Respect copyright and platform terms.
        </p>
        <div className="flex gap-7">
          <a href="#top" className="mono transition-colors hover:text-white">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
