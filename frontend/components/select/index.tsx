import React, { useEffect, useRef, useState } from 'react'
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
  showAll?: boolean
}

type SelectState = {
  canBlur: boolean
  filter: string
  focused: number
  inputFocused: boolean
  menuFocused: boolean
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
    allowAdd,
    showAll
  } = props

  const [selectState, setSelectState] = useState<SelectState>({
    filter: '',
    canBlur: true,
    focused: 0,
    inputFocused: false,
    menuFocused: false
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const { filter, canBlur, focused } = selectState

  const unselected = options.filter(x => !selected.includes(x))

  const filteredOptions = filter
    ? unselected.filter(o => o.toLowerCase().includes(filter.toLowerCase()))
    : unselected

  const optionResults = filteredOptions.length === 0 && allowAdd
    ? [filter]
    : filteredOptions

  const maxHeight = optionResults.length * 3 + 3

  const handleClick = (val: string) => {
    if ((filter || showAll) && inputRef.current) {
      addValue(val)
      setSelectState(st => ({
        ...st,
        canBlur: true,
        filter: '',
        focused: 0,
        menuFocused: false,
        inputFocused: false
      }))
      inputRef.current.blur()
    }
  }

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((filter || showAll) && inputRef.current) {
        if ((e.key === 'ArrowDown' || e.code === 'ArrowDown')
          && focused != optionResults.length - 1
        ) {
          e.preventDefault()
          setSelectState(st => ({...st, focused: st.focused + 1}))
        }
        
        if ((e.key === 'ArrowUp' || e.code === 'ArrowUp')
          && focused != 0
        ) {
          e.preventDefault()
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
  }, [focused, filter, optionResults, inputRef])

  useEffect(() => {
    setSelectState(st => ({ ...st, focused: 0 }))
  }, [optionResults.length])

  const handleInputBlur = () => {
    if (selectState.menuFocused) {
      return
    }

    setSelectState(st => ({...st, inputFocused: false }))
  }

  return (
    <div
      tabIndex={0}
      className={styles.dropdown}
      aria-expanded={!!filter || (selectState.inputFocused && showAll)}
      aria-pressed={!!filter  || (selectState.inputFocused && showAll)}
      onBlur={() => { canBlur && setSelectState(st => ({...st, filter: ''})) }}
    >
      <label htmlFor={name}>{label}</label>
      {(allowMultiple || selected.length === 0) &&
        <input
          name={name}
          id={name}
          value={filter}
          onChange={e => setSelectState(st => ({...st, filter: e.target.value }))}
          onFocus={() => setSelectState(st => ({...st, inputFocused: true }))}
          onBlur={handleInputBlur}
          type='text'
          className={styles.textbox}
          placeholder={placeholder}
          style={{ borderColor: error ? 'red' : 'transparent'}}
          ref={inputRef}
        />}
      <div
        className={styles.options}
        data-testid='select-options'
        onMouseEnter={() => setSelectState(st => ({...st, menuFocused: true }))}
        onMouseLeave={() => setSelectState(st => ({...st, menuFocused: false }))}
        style={{ maxHeight: filter || (showAll && selectState.inputFocused)
          ? `${maxHeight}rem` : 0 }}
      >
        {optionResults.map((o,i) => (
          <button
            type='button'
            aria-current={focused === i}
            onMouseEnter={() => setSelectState(st => ({...st, canBlur: false, focused: i }))}
            onMouseLeave={() => setSelectState(st => ({...st, canBlur: true, focused: 0 }))}
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