import styles from './home.module.scss'
import { Oswald } from 'next/font/google'

const oswald = Oswald({
  weight: '600',
  subsets: ['latin'],
})

export function HomeComponent() {

  return (
    <div className={styles.home}>
      <h1>A Networking Platform for<br></br>In-Home Personal Trainers and Clients</h1>

      <div className={styles.headlinesContainer}>
        <div className={styles.headlines}>
          <div className={styles.trainers}>
            <h2 className={oswald.className}>Trainers</h2>
            <div>
              <h4>Build a page</h4>
              <span className="material-symbols-outlined">
                home
              </span>
            </div>
            <h4>Connect with clients</h4>
            <h4>Grow your network</h4>
          </div>
          <div className={styles.clients}>
            <h2 className={oswald.className}>Clients</h2>
            <h4>Find trainers in your area</h4>
            <h4>Get matched based on your needs</h4>
            <h4>Reach your fitness goals at home</h4>
          </div>
        </div>
      </div>

      <p>Coming soon...</p>
    </div>
  )
}