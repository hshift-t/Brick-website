import { navigation } from '../data/siteData';
import { AppIcon } from './AppIcon';

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <a href="#top" className="flex items-center gap-3">
        <AppIcon size={34} />
        <span className="font-semibold tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          Brick
        </span>
      </a>

      <nav className="hidden items-center gap-8 md:flex">
        {navigation.map((item) => (
          <a key={item.href} href={item.href} className="mono transition-colors hover:text-white">
            {item.label}
          </a>
        ))}
      </nav>

      <a href="#download" className="btn btn-primary !px-5 !py-2.5 text-sm">
        Get the app
      </a>
    </header>
  );
}
