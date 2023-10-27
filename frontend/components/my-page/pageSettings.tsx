import React, { useEffect, useState } from 'react'
import styles from './pageSettings.module.scss'
import { Page } from '../types'
import { Toggle } from '../toggle'

export type PageSettings = {
  slug: string
  title: string
  active: boolean
  description: string
}

export type SettingsError = {
  slug?: boolean
  title?: boolean
  description?: boolean
} | null

export type PageSettingsProps = {
  update: (settings: PageSettings) => void
  page: Page
  settingsError: SettingsError
}

export const PageSettings: React.FC<PageSettingsProps> = (props) => {
  const { update, page, settingsError } = props
  const [open, setOpen ] = useState(false)

  const settings = {
    slug: page.slug,
    title: page.title,
    active: page.active,
    description: page.description,
  }

  const onChange = (
    evt: React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const key = evt.target.name
    update({
      ...settings,
      [key]: evt.target.value
    })
  }

  const onActiveChange = (checked: boolean) => {
    update({
      ...settings,
      active: checked,
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
        left: open ? 0 : '-10.5rem'
      }}
    >
      <form onSubmit={e => e.preventDefault()}>
        <fieldset>
          <label htmlFor='slug'>Slug</label>
          <input
            id='slug'
            name='slug'
            value={settings.slug}
            onChange={onChange}
            style={inputStyle('slug')}
          />
        </fieldset>
       
        <fieldset>
          <label htmlFor='title'>Title</label>
          <textarea
            id='title'
            name='title' 
            value={settings.title}
            onChange={onChange}
            style={inputStyle('title')}
          />
        </fieldset>
        
        <fieldset>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            name='description' 
            value={settings.description}
            onChange={onChange}
            style={inputStyle('description')}
          />
        </fieldset>
        
        <fieldset>
          <Toggle
            checked={settings.active}
            onChange={onActiveChange}
            label='Active'
            dataTestId='active-switch'
          />
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