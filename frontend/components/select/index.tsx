import React, { useEffect, useRef, useState } from 'react'
import styles from './select.module.scss'
import cn from 'classnames'
import { Selected } from '../selected'
import { Option } from './types'
import { MY_PAGE_FONTS } from '../layout'

type SelectProps = {
  name: string
  label: string
  options: Option[]
  addValue: (val: any) => void
  allowMultiple?: boolean
  selected: Option[]
  onRemove: (val: any) => void
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

  const unselected = options.filter(x => !selected.find(s => s.value === x.value))

  const filteredOptions = filter
    ? unselected.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
    : unselected

  const optionResults = filteredOptions.length === 0 && allowAdd
    ? [{ label: filter, value: filter }]
    : filteredOptions

  const maxHeight = optionResults.length * 3 + 3

  const handleClick = (val: any) => {
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
    const isFocused = selectState.inputFocused || selectState.menuFocused

    const onKeydown = (e: KeyboardEvent) => {
      if ((filter || showAll) && inputRef.current && isFocused) {
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
          handleClick(optionResults[focused].value)
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

  return (
    <div
      tabIndex={0}
      className={cn(styles.dropdown, MY_PAGE_FONTS.roboto.className)}
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
            onClick={() => handleClick(o.value)}
            className={cn(styles.optionButton, {
              [styles.focused]: focused === i,
              'focused': focused === i
            })}
          >
            {o.label}
          </button>
        ))}
      </div>
      {selected.length > 0 && <div className={styles.selected}>
        {selected.map((c, i) => (
          <Selected
            key={i}
            onRemove={() => onRemove(c.value)}
            text={c.label}
          />
        ))}
      </div>}
    </div>
  )
}
