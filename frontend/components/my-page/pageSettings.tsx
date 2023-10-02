import React, { useEffect, useState } from 'react'
import styles from './pageSettings.module.scss'
import { Page } from '../types'

export type PageSettings = {
  slug: string
  title: string
  city: string
  active: boolean
}

export type SettingsError = {
  slug?: boolean
  title?: boolean
  city?: boolean
} | null

export type PageSettingsProps = {
  update: (settings: PageSettings) => void
  page: Page
  settingsError: SettingsError
}

export const PageSettings: React.FC<PageSettingsProps> = (props) => {
  const { update, page, settingsError } = props
  const [open, setOpen ] = useState(false)

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
  }

  const settings = {
    slug: page.slug,
    title: page.title,
    city: page.city,
    active: page.active
  }

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>, key: string) => {
    update({
      ...settings,
      [key]: key === 'active'
        ? evt.target.checked
        : evt.target.value
    })
  }

  useEffect(() => {
    if (settingsError) {
      setOpen(true)
    }
  }, [settingsError])

  const inputStyle = (field: string) => ({
    borderColor: !!settingsError?.[field as keyof SettingsError] ? 'red' : 'transparent'
  })

  return (
    <div
      data-testid='page-settings'
      className={styles.pageSettings}
      style={{
        left: open ? 0 : '-9.5rem'
      }}
    >
      <form onSubmit={onSubmit}>
        <fieldset>
          <label htmlFor='slug'>Slug</label>
          <input
            id='slug'
            name='slug'
            value={settings.slug}
            onChange={e => onChange(e, 'slug')}
            style={inputStyle('slug')}
          />
        </fieldset>
       
        <fieldset>
          <label htmlFor='title'>Title</label>
          <input
            id='title'
            name='title' 
            value={settings.title}
            onChange={e => onChange(e, 'title')}
            style={inputStyle('title')}
          />
        </fieldset>
        
        <fieldset>
          <label htmlFor='city'>City</label>
          <input
            id='city'
            name='city'
            value={settings.city}
            onChange={e => onChange(e, 'city')}
            style={inputStyle('city')}
          />
        </fieldset>

        <fieldset>
          <label className={styles.switch}>
            Active
            <input
              id='active'
              type="checkbox"
              checked={settings.active}
              onChange={e => onChange(e, 'active')}
              name='active'
            />
            <span className={styles.slider}></span>
          </label>
        </fieldset>
        
      </form>
      <div className={styles.openButton}>
        <button onClick={() => setOpen(!open)} id='open-settings'>
          <span className={"material-symbols-outlined"}>settings</span> 
        </button>
      </div>
    </div>
  )
}