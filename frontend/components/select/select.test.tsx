import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Select } from '.'

const addValue = jest.fn()
const onRemove = jest.fn()

const keydown = (key: string) => {
  act(() => document.dispatchEvent(
    new KeyboardEvent(
        'keydown', {     
            key,
            code: key
        }
    )
  ))
}

const getInput = () => screen.queryByRole('textbox') as HTMLInputElement

const defaultOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
]

describe('select component', () => {
  it('renders selected and hides input if no allow multiple', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: false,
      selected: [defaultOptions[0]],
      onRemove,
      placeholder: 'test'
    }} />)

    expect(getInput()).not.toBeInTheDocument()
    expect(screen.getByTestId('selected-Option 1')).toBeInTheDocument()
  })
 
  it('shows error border color', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: false,
      selected: [],
      onRemove,
      placeholder: 'test',
      error: true
    }} />)

    expect(screen.queryByRole('textbox')!.style.borderColor).toBe('red')
  })
  
  it('shows transparent border color', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: false,
      selected: [],
      onRemove,
      placeholder: 'test',
      error: false
    }} />)

    expect(getInput().style.borderColor).toBe('transparent')
  })
  
  it('renders multiple selected with input', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: defaultOptions,
      onRemove,
      placeholder: 'test'
    }} />)

    expect(getInput()).toBeInTheDocument()
    expect(screen.getByTestId('selected-Option 1')).toBeInTheDocument()
    expect(screen.getByTestId('selected-Option 2')).toBeInTheDocument()
  })
  
  it('hides option menu with empty filter', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
  })
  
  it('shows all options if show all true and input focused', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test',
      showAll: true
    }} />)

    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
    await (act(() => userEvent.click(getInput())))
    expect(screen.getByTestId('select-options')!.style.maxHeight).not.toBe('0')
  })
  
  it('filters out selected from menu', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [defaultOptions[0]],
      onRemove,
      placeholder: 'test',
      showAll: true
    }} />)

    await (act(() => userEvent.click(getInput())))
    const menu = screen.getByTestId('select-options')
    expect(menu).toHaveTextContent('Option 2')
    expect(menu).not.toHaveTextContent('Option 1')
  })
  
  it('shows filtered option menu with filter', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), '1'))
    expect(screen.getByTestId('select-options')!.style.maxHeight).not.toBe('0')
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
  })
  
  it('selects val on click', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), '1'))
    await act(() => userEvent.click(screen.getByText('Option 1')))
    expect(addValue).toBeCalledWith('option1')
  })
  
  it('closes menu on select', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), '1'))
    await act(() => userEvent.click(screen.getByText('Option 1')))
    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
  })
  
  it('closes menu on select when empty filter and show all', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test',
      showAll: true
    }} />)

    await act(() => userEvent.click(getInput()))
    await act(() => userEvent.click(screen.getByText('Option 1')))
    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
    expect(addValue).toBeCalledWith('option1')
  })
  
  it('selects val on enter', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), '1'))
    
    keydown('Enter')

    expect(addValue).toBeCalledWith('option1')
  })
  
  it('selects entered text on enter if empty filterOptions and allowAdd', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: [],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test',
      allowAdd: true
    }} />)

    await act(() => userEvent.type(getInput(), 'new value'))
    
    keydown('Enter')

    expect(addValue).toBeCalledWith('new value')
  })
  
  it('navigates menu', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), 'option'))

    keydown('ArrowDown')

    expect(screen.getByText('Option 2')).toHaveAttribute('aria-current', 'true')

    keydown('ArrowUp')

    expect(screen.getByText('Option 1')).toHaveAttribute('aria-current', 'true')
  })
  
  it('ignores navigating passed last item', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), 'option'))

    keydown('ArrowDown')
    keydown('ArrowDown')

    expect(screen.getByText('Option 2')).toHaveAttribute('aria-current', 'true')
  })

  it('ignores navigating before first item', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), 'option'))

    keydown('ArrowUp')

    expect(screen.getByText('Option 1')).toHaveAttribute('aria-current', 'true')
  })
  
  it('selects on enter after navigating menu', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(getInput(), 'option'))

    keydown('ArrowDown')
    keydown('Enter')

    expect(addValue).toBeCalledWith('option2')
  })

  it('removes selected', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: defaultOptions,
      addValue,
      allowMultiple: false,
      selected: [{ label: 'Option 1', value: 'option1' }],
      onRemove,
      placeholder: 'test'
    }} />)

    await userEvent.click(screen.getByTestId('remove-selected-Option 1'))
    expect(onRemove).toBeCalledWith('option1')
  })
})
