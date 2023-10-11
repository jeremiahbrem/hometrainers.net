import styles from './home.module.scss'
import { Oswald } from 'next/font/google'
import Image from 'next/image'

const oswald = Oswald({
  weight: '600',
  subsets: ['latin'],
})

const IconListItem: React.FC<{ text: string; icon: string; }> = ({ text, icon }) => (
  <li>
    <span className="material-symbols-outlined">{icon}</span>
    <h4>{text}</h4>
  </li>
)

const trainerImage = '/jonathan-borba-R0y_bEUjiOM-unsplash.jpg'
const trainerAlt = 'image by Jonathan Borba from Upsplash'
const clientImage = '/bruce-mars-gJtDg6WfMlQ-unsplash.jpg'
const clientAlt = 'image by Bruce Mars from Upsplash'

export function HomeComponent() {

  return (
    <div className={styles.home}>
      <h1>A Networking Platform for<br></br>In-Home Personal Trainers and Clients</h1>

      <div className={styles.headlinesContainer}>
        <div className={styles.headlines}>
          <div className={styles.trainers}>
            <Image
              src={trainerImage}
              alt={trainerAlt}
              height={0}
              width={0}
              className={styles.image}
            />
            <div className={styles.overlay} />
            <h2 className={oswald.className}>Trainers</h2>
            <ul>
              <IconListItem {...{
                text: 'Build a page',
                icon: 'contact_page'
              }} />
              <IconListItem {...{
                text: 'Connect with clients',
                icon: 'person_add'
              }} />
              <IconListItem {...{
                text: 'Grow your network',
                icon: 'hub'
              }} />
            </ul>
          </div>
          <div className={styles.clients}>
            <Image
              src={clientImage}
              alt={clientAlt}
              height={0}
              width={0}
              className={styles.image}
            />
            <div className={styles.overlay} />
            <h2 className={oswald.className}>Clients</h2>
            <ul>
              <IconListItem {...{
                text: 'Find trainers in your area',
                icon: 'manage_search'
              }} />
              <IconListItem {...{
                text: 'Get matched based on your needs',
                icon: 'join_right'
              }} />
              <IconListItem {...{
                text: 'Reach your fitness goals at home',
                icon: 'home'
              }} />
            </ul>
          </div>
        </div>
      </div>

      <p className={styles.coming}>Coming soon...</p>
    </div>
  )
}