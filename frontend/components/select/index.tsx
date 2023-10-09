import React, { useEffect, useState } from 'react'
import styles from './select.module.scss'
import cn from 'classnames'
import { Selected } from '../selected'

type SelectProps = {
  name: string
  label: string
  options: string[]
  addValue: (val: string) => void
  allowMultiple?: boolean
  selected: string[]
  onRemove: (val: string) => void
  placeholder: string
  allowAdd?: boolean
  error?: boolean
}

type SelectState = {
  canBlur: boolean
  filter: string
  focused: number
}

export const Select: React.FC<SelectProps> = (props) => {
  const {
    addValue,
    selected,
    onRemove,
    placeholder,
    options,
    allowMultiple,
    name,
    label,
    error,
    allowAdd
  } = props

  const [selectState, setSelectState] = useState<SelectState>({
    filter: '',
    canBlur: true,
    focused: 0
  })

  const { filter, canBlur, focused } = selectState

  const unselected = options.filter(x => !selected.includes(x))

  const filteredOptions = filter
    ? unselected.filter(o => o.toLowerCase().includes(filter.toLowerCase()))
    : unselected

  const optionResults = filteredOptions.length === 0 && allowAdd
    ? [filter]
    : filteredOptions

  const maxHeight = filteredOptions.length * 3 + 3

  const handleClick = (val: string) => {
    if (filter) {
      addValue(val)
      setSelectState({
        canBlur: true,
        filter: '',
        focused: 0
      })
    }
  }

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (filter) {
        if ((e.key === 'ArrowDown' || e.code === 'ArrowDown')
          && focused != optionResults.length - 1
        ) {
          setSelectState(st => ({...st, focused: st.focused + 1}))
        }
        
        if ((e.key === 'ArrowUp' || e.code === 'ArrowUp')
          && focused != 0
        ) {
          setSelectState(st => ({...st, focused: st.focused - 1}))
        }

        if (e.key === 'Enter' || e.code === 'Enter'
        ) {
          handleClick(optionResults[focused])
        }
      }
    }

    document.addEventListener('keydown', onKeydown)

    return (() => {
      document.removeEventListener('keydown', onKeydown)
    })
  }, [focused, filter, optionResults])

  useEffect(() => {
    setSelectState(st => ({ ...st, focused: 0 }))
  }, [optionResults.length])

  return (
    <div
      tabIndex={0}
      className={styles.dropdown}
      aria-expanded={!!filter}
      aria-pressed={!!filter}
      onBlur={() => { canBlur && setSelectState(st => ({...st, filter: ''})) }}
    >
      <label htmlFor={name}>{label}</label>
      {(allowMultiple || selected.length === 0) &&
        <input
          name={name}
          id={name}
          value={filter}
          onChange={e => setSelectState(st => ({...st, filter: e.target.value }))}
          type='text'
          className={styles.textbox}
          placeholder={placeholder}
          style={{ borderColor: error ? 'red' : 'transparent'}}
        />}
      <div
        className={styles.options}
        data-testid='select-options'
        style={{ maxHeight: filter ? `${maxHeight}rem` : 0 }}
      >
        {optionResults.map((o,i) => (
          <button
            type='button'
            aria-current={focused === i}
            onMouseEnter={() => setSelectState(st => ({...st, canBlur: false }))}
            onMouseLeave={() => setSelectState(st => ({...st, canBlur: true }))}
            key={i}
            onClick={() => handleClick(o)}
            className={cn(styles.optionButton, {
              [styles.focused]: focused === i,
              'focused': focused === i
            })}
          >
            {o}
          </button>
        ))}
      </div>
      {selected.length > 0 && <div className={styles.selected}>
        {selected.map((c, i) => (
          <Selected
            key={i}
            onRemove={() => onRemove(c)}
            text={c}
          />
        ))}
      </div>}
    </div>
  )
}