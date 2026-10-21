import feedScreenshot from '../assets/1.jpeg';
import playerScreenshot from '../assets/2.jpeg';
import savedScreenshot from '../assets/3.jpeg';

export const navigation = [
  { label: 'Showcase', href: '#showcase' },
  { label: 'Download', href: '#download' },
  { label: 'Install guide', href: '#install' },
];

export const downloads = [
  {
    os: 'Android',
    detail: 'APK · v1.0.0',
    size: '60.4 MB',
    cta: 'Download',
    href: '/downloads/Brick-Downloader.v1.0.0.apk',
  },
];

export const showcaseItems = [
  { variant: 'feed', label: '01 · Paste link', image: feedScreenshot },
  { variant: 'player', label: '02 · Pick quality', image: playerScreenshot },
  { variant: 'list', label: '03 · Saved offline', image: savedScreenshot },
];
