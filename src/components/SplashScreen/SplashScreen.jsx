import { useEffect, useState } from 'react'
import styles from './SplashScreen.module.scss'

export default function SplashScreen({ onComplete, videoSrc }) {
  const [phase, setPhase] = useState('start') // 'start' | 'dimming' | 'logo' | 'out'

  useEffect(() => {
    // Faza 1: Video gra 1.2s
    const t1 = setTimeout(() => setPhase('dimming'), 1200)
    // Faza 2: Przyciemnianie 0.6s
    const t2 = setTimeout(() => setPhase('logo'), 1800)
    // Faza 3: Napisy widoczne 1.8s
    const t3 = setTimeout(() => setPhase('out'), 3600)
    // Faza 4: Fade out 0.4s → unmount
    const t4 = setTimeout(() => onComplete(), 4000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

  return (
    <div className={`${styles.splash} ${phase === 'out' ? styles.fadeOut : ''}`}>

      {/* Tło — wideo lub gradient fallback */}
      {videoSrc ? (
        <video
          className={styles.videoBg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={videoSrc} />
        </video>
      ) : (
        <div className={styles.gradientBg}>
          <div className={styles.gradient1}></div>
          <div className={styles.gradient2}></div>
          <div className={styles.gradient3}></div>
        </div>
      )}

      {/* Nakładka przyciemniająca */}
      <div className={`${styles.dimOverlay} ${phase === 'dimming' || phase === 'logo' ? styles.dimVisible : ''}`}></div>

      {/* Napisy */}
      <div className={`${styles.content} ${phase === 'logo' ? styles.contentVisible : ''}`}>
        <h1 className={styles.title}>PERIA</h1>
        <p className={styles.subtitle}>
          Gdy myśl się pojawia wtedy, gdy jej nie szukasz
        </p>
      </div>

    </div>
  )
}
