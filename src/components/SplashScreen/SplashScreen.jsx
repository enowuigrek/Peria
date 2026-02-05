import { useEffect, useState } from 'react'
import styles from './SplashScreen.module.scss'

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Wait for fade out
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className={`${styles.splash} ${!isVisible ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Peria</h1>
        <p className={styles.subtitle}>Gdzie myśl się rodzi</p>
      </div>
      <div className={styles.gradient1}></div>
      <div className={styles.gradient2}></div>
      <div className={styles.gradient3}></div>
    </div>
  )
}
