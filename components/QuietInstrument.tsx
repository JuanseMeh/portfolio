"use client";

import { useEffect, useState } from "react";
import ArchitectureMap from "./ArchitectureMap";
import ContourField from "./ContourField";
import { capabilities, links } from "@/lib/content";
import styles from "./QuietInstrument.module.css";

function useBogotaTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const update = () => setTime(formatter.format(new Date()));
    update();
    const interval = window.setInterval(update, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return time;
}

export default function QuietInstrument() {
  const time = useBogotaTime();

  return (
    <>
      <a className={styles.skip} href="#content">
        Skip to content
      </a>

      <ContourField />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <main className={styles.instrument} id="content">
        <header className={styles.rail}>
          <a className={styles.brand} href="#content" aria-label="Sebastián Uribe, home">
            <span className={styles.monogram} aria-hidden="true">
              SU
            </span>
            <span className={styles.brandName}>Sebastián Uribe</span>
          </a>

          <span className={styles.railRole}>Systems / Identity / Data</span>

          <div className={styles.railMeta}>
            <span className={styles.dot} aria-hidden="true" />
            <span>Bogotá, CO</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <time aria-label="Local time in Bogotá">{time}</time>
          </div>
        </header>

        <section className={styles.stage} aria-labelledby="statement">
          <div className={styles.identity}>
            <p className={styles.kicker}>
              <span className={styles.kickerMark} aria-hidden="true" />
              Backend &amp; Systems Engineer
            </p>

            <h1 className={styles.statement} id="statement">
              I build the infrastructure behind digital <em>institutions.</em>
            </h1>

            <p className={styles.lede}>
              I&apos;m Sebastián Uribe. I work on identity, contracts and data
              boundaries — the parts that let many services behave like one
              product.
            </p>

            <p className={styles.now}>
              <span className={styles.nowDot} aria-hidden="true" />
              <span>Currently building</span>
              <a href={links.agora} target="_blank" rel="noreferrer">
                Ágora — open core <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>

          <div className={styles.mapSlot}>
            <ArchitectureMap />
          </div>
        </section>

        <section className={styles.index} aria-labelledby="capabilities">
          <div className={styles.indexHead}>
            <h2 id="capabilities">Capabilities</h2>
            <span>06</span>
          </div>

          <div className={styles.indexGrid}>
            {capabilities.map((item) => (
              <article className={styles.item} key={item.index}>
                <span className={styles.itemIndex}>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>© 2026 Sebastián Uribe</span>

          <nav className={styles.links} aria-label="Contact and profiles">
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a href={`mailto:${links.email}`}>
              Email <span aria-hidden="true">↗</span>
            </a>
          </nav>

          <span className={styles.build}>Next.js · Canvas · No UI libraries</span>
        </footer>
      </main>
    </>
  );
}
