import { motion } from 'framer-motion';

import { AppIcon } from './AppIcon';
import { rise } from '../utils/animations';

export function HeroSection() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <motion.div initial="hidden" animate="show" variants={rise}>
        <p className="mono">01 — Media extraction, distilled</p>
      </motion.div>

      <div className="mt-8 grid items-end gap-10 md:grid-cols-[1.35fr_1fr]">
        <div>
          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={rise}
            className="text-[clamp(2.6rem,8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
          >
            Take it
            <br />
            <span className="grad-text">with you.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={rise}
            className="mt-7 max-w-md text-[1.02rem] leading-relaxed"
            style={{ color: 'var(--dim)' }}
          >
            Save video and audio from supported platforms like YouTube, Instagram,
            and Pinterest, plus 1000+ other sites. Free, with no account or telemetry.
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="show" variants={rise} className="mt-9 flex flex-wrap gap-3">
            <a href="#download" className="btn btn-primary">Download free</a>
            <a href="#showcase" className="btn btn-ghost">See it work</a>
          </motion.div>
        </div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={rise}
          className="flex items-center gap-5 md:justify-end"
        >
          <AppIcon size={96} />
          <div className="grid gap-2">
            <span className="mono">Brick - Downloader</span>
            <span className="text-sm" style={{ color: 'var(--dim)' }}>v1.0.0 · 60.4 MB</span>
            <span
              className="mt-1 inline-flex w-fit items-center rounded-full border px-3 py-1 
              bg-violet-800 color-white text-xs font-medium"
              style={{ borderColor: 'var(--line)'}}
            >
              5k+ installs
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rule mt-16 origin-left"
      />
    </section>
  );
}
