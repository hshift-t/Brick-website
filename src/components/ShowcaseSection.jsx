import { motion } from 'framer-motion';

import { Phone } from './Phone';
import { showcaseItems } from '../data/siteData';
import { inView, rise } from '../utils/animations';

export function ShowcaseSection() {
  return (
    <section id="showcase" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-baseline justify-between gap-6">
        <motion.p custom={0} initial="hidden" whileInView="show" viewport={inView} variants={rise} className="mono">
          02 — Showcase
        </motion.p>
      </div>

      <motion.h2
        custom={1}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={rise}
        className="mt-6 max-w-2xl text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
      >
        Three taps. The file is yours.
      </motion.h2>

      <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10">
        {showcaseItems.map((item, index) => (
          <motion.div
            key={item.label}
            custom={index}
            initial="hidden"
            whileInView="show"
            viewport={inView}
            variants={rise}
            className={index === 1 ? 'md:-mt-10' : index === 2 ? 'col-span-2 md:col-span-1 md:mt-16' : ''}
          >
            <div className={index === 0 ? 'float-a' : index === 1 ? 'float-b' : 'float-c'}>
              <Phone variant={item.variant} image={item.image} />
            </div>
            <p className="mono mt-5">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
