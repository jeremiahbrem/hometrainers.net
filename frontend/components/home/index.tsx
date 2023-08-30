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
              <span className="material-symbols-outlined">contact_page</span>
              <h4>Build a page</h4>
            </div>
            <div>
              <span className="material-symbols-outlined">person_add</span>
              <h4>Connect with clients</h4>
            </div>
            <div>
              <span className="material-symbols-outlined">hub</span>
              <h4>Grow your network</h4>
            </div>
          </div>
          <div className={styles.clients}>
            <h2 className={oswald.className}>Clients</h2>
            <div>
              <span className="material-symbols-outlined">manage_search</span>
              <h4>Find trainers in your area</h4>
            </div>
            <div>
              <span className="material-symbols-outlined">join_right</span>
              <h4>Get matched based on your needs</h4>
            </div>
            <div>
              <span className="material-symbols-outlined">home</span>
              <h4>Reach your fitness goals at home</h4>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.coming}>Coming soon...</p>
    </div>
  )
}