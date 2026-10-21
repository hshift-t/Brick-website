import { motion } from 'framer-motion';

import { downloads } from '../data/siteData';
import { inView, rise } from '../utils/animations';

export function DownloadSection() {
  return (
    <>
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
              <a
                href={d.href}
                download
                className="btn btn-ghost !px-5 !py-2 text-sm"
                aria-label={`Download Brick for ${d.os}`}
              >
                {d.cta} →
              </a>
            </motion.div>
          ))}
          <div className="rule" />
        </div>

        <motion.p custom={3} initial="hidden" whileInView="show" viewport={inView} variants={rise} className="mono mt-8">
          No root · No account · No telemetry
        </motion.p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
          Brick is offered here as an Android APK. It is not listed in the Google Play Store.
        </p>
      </section>

      <section id="install" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="install-heading">
        <p className="mono">04 — Install guide</p>
        <h2
          id="install-heading"
          className="mt-6 max-w-3xl text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
        >
          A few simple steps. <span className="grad-text">You’re in control.</span>
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: 'var(--dim)' }}>
          New to APKs? Follow the steps below at your own pace. Android may ask for permission to install an app
          from your browser; that is different from a warning that the app itself is harmful. [Brick is completely safe to install and use]
        </p>

        <ol className="install-steps mt-10">
          <li className="install-step">
            <span className="install-step-number" aria-hidden="true">01</span>
            <div>
              <h3 className="text-lg font-semibold">Get the APK</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                Tap <a href="#download" className="underline underline-offset-4">Download</a> above. Your browser
                will show the file in its downloads list when it is ready.
              </p>
            </div>
          </li>
          <li className="install-step">
            <span className="install-step-number" aria-hidden="true">02</span>
            <div>
              <h3 className="text-lg font-semibold">Open the downloaded file</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                Tap the download notification, or find the APK in your browser&apos;s Downloads list or the Files app.
              </p>
            </div>
          </li>
          <li className="install-step">
            <span className="install-step-number" aria-hidden="true">03</span>
            <div>
              <h3 className="text-lg font-semibold">Allow your browser, if Android asks</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                Android may ask you to allow this browser to install apps. If you choose to continue, allow only
                the browser you used, return to the installer, and turn the permission off again later in Settings
                if you wish. The menu wording varies by phone.
              </p>
            </div>
          </li>
          <li className="install-step">
            <span className="install-step-number" aria-hidden="true">04</span>
            <div>
              <h3 className="text-lg font-semibold">Check the prompt, then install</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                Make sure Android says Brick before tapping Install. When it finishes, open Brick from your app list.
              </p>
            </div>
          </li>
        </ol>

        <aside className="install-safety mt-8">
          <p className="mono">Your safety comes first</p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
            An “unknown app” notice is about where an APK came from; it is not a safety check. Keep Google Play
            Protect on. If Play Protect says Brick is harmful or blocks it, stop and do not bypass the warning.
          </p>
        </aside>
      </section>
    </>
  );
}
