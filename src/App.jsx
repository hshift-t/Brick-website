import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { DownloadSection } from './components/DownloadSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <>
      <div className="backdrop" />

      <div className="relative z-10">
        <Header />
        <HeroSection />
        <ShowcaseSection />
        <DownloadSection />
        <Footer />
      </div>
    </>
  );
}
