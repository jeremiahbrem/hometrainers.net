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

describe('select component', () => {
  it('renders selected and hides input if no allow multiple', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: false,
      selected: ['option1'],
      onRemove,
      placeholder: 'test'
    }} />)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByTestId('selected-option1')).toBeInTheDocument()
  })
 
  it('shows error border color', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
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
      options: ['option1','option2'],
      addValue,
      allowMultiple: false,
      selected: [],
      onRemove,
      placeholder: 'test',
      error: false
    }} />)

    expect(screen.queryByRole('textbox')!.style.borderColor).toBe('transparent')
  })
  
  it('renders multiple selected with input', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: ['option1','option2'],
      onRemove,
      placeholder: 'test'
    }} />)

    expect(screen.queryByRole('textbox')).toBeInTheDocument()
    expect(screen.getByTestId('selected-option1')).toBeInTheDocument()
    expect(screen.getByTestId('selected-option2')).toBeInTheDocument()
  })
  
  it('hides option menu with empty filter', () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: ['option1','option2'],
      onRemove,
      placeholder: 'test'
    }} />)

    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
  })
  
  it('shows filtered option menu with filter', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), '1'))
    expect(screen.getByTestId('select-options')!.style.maxHeight).not.toBe('0')
    expect(screen.getByText('option1')).toBeInTheDocument()
    expect(screen.queryByText('option2')).not.toBeInTheDocument()
  })
  
  it('selects val on click', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), '1'))
    await act(() => userEvent.click(screen.getByText('option1')))
    expect(addValue).toBeCalledWith('option1')
  })
  
  it('closes menu on select', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), '1'))
    await act(() => userEvent.click(screen.getByText('option1')))
    expect(screen.getByTestId('select-options')!.style.maxHeight).toBe('0')
  })
  
  it('selects val on enter', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), '1'))
    
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

    await act(() => userEvent.type(screen.getByRole('textbox'), 'new value'))
    
    keydown('Enter')

    expect(addValue).toBeCalledWith('new value')
  })
  
  it('navigates menu', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), 'option'))

    keydown('ArrowDown')

    expect(screen.getByText('option2')).toHaveAttribute('aria-current', 'true')

    keydown('ArrowUp')

    expect(screen.getByText('option1')).toHaveAttribute('aria-current', 'true')
  })
  
  it('ignores navigating passed last item', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), 'option'))

    keydown('ArrowDown')
    keydown('ArrowDown')

    expect(screen.getByText('option2')).toHaveAttribute('aria-current', 'true')
  })

  it('ignores navigating before first item', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), 'option'))

    keydown('ArrowUp')

    expect(screen.getByText('option1')).toHaveAttribute('aria-current', 'true')
  })
  
  it('selects on enter after navigating menu', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: true,
      selected: [],
      onRemove,
      placeholder: 'test'
    }} />)

    await act(() => userEvent.type(screen.getByRole('textbox'), 'option'))

    keydown('ArrowDown')
    keydown('Enter')

    expect(addValue).toBeCalledWith('option2')
  })

  it('removes selected', async () => {
    render(<Select {...{
      name: 'name',
      label: 'Label',
      options: ['option1','option2'],
      addValue,
      allowMultiple: false,
      selected: ['option1'],
      onRemove,
      placeholder: 'test'
    }} />)

    await userEvent.click(screen.getByTestId('remove-selected-option1'))
    expect(onRemove).toBeCalledWith('option1')
  })
})
