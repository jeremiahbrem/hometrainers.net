import Image from 'next/image'
import styles from './logo.module.scss'
import Link from 'next/link'

type LogoProps = {
  className?: string
  logo?: string
}

export function Logo({ className, logo }: LogoProps) {
  return (
    <Link href='/' className={[styles.logoContainer, className].filter(x => x).join(' ')}>
      <Image src={logo ?? '/hpt-logo.svg'} alt={'home personal trainer logo'} height={0} width={0} />
    </Link>
  )
}