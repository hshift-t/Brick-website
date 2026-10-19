import { motion } from 'framer-motion';

import { downloads } from '../data/siteData';
import { inView, rise } from '../utils/animations';

export function DownloadSection() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-6 py-24">
      <motion.p custom={0} initial="hidden" whileInView="show" viewport={inView} variants={rise} className="mono">
        03 — Download
      </motion.p>

      <motion.h2
        custom={1}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={rise}
        className="mt-6 text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
      >
        Free. <span className="grad-text">Forever.</span>
      </motion.h2>

      <div className="mt-12">
        {downloads.map((d, i) => (
          <motion.div
            key={d.os}
            custom={i}
            initial="hidden"
            whileInView="show"
            viewport={inView}
            variants={rise}
            className="dl-row"
          >
            <span className="text-lg font-medium" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {d.os}
            </span>
            <span className="dl-meta mono">{d.detail}</span>
            <span className="dl-meta mono">{d.size}</span>
            <a href={d.href} download className="btn btn-ghost !px-5 !py-2 text-sm">
              {d.cta} →
            </a>
          </motion.div>
        ))}
        <div className="rule" />
      </div>

      <motion.p custom={3} initial="hidden" whileInView="show" viewport={inView} variants={rise} className="mono mt-8">
        No root · No account · No telemetry
      </motion.p>
    </section>
  );
}
