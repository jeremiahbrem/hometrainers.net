import React from 'react'
import { PageLinkPicker } from '.'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

const updateLinks = jest.fn()
const setOpen = jest.fn()

const blockNames = [
  'header',
  'text-image-left',
  'icon-text-row',
  'two-column-text',
  'footer'
]

const defaultProps = {
  updateLinks,
  setOpen,
  blockNames,
  open: true
}

const clickSelect = async () => {
  await act(() =>
    userEvent.click(screen.getByRole('textbox', { name: /Select block/ }))
  )
}

describe('PageLinkPicker', () => {
  it('renders block options', async () => {
    render(<PageLinkPicker
      {...defaultProps }
      blockNames={defaultProps.blockNames.slice(1)}
    />)

    await clickSelect()

    const expected = [
      '1 Text Image Left',
      '2 Icon Text Row',
      '3 Two Column Text'
    ]

    expected.forEach(e => expect(screen.getByText(e)).toBeInTheDocument())
  })
  
  it('does not use zero-based indexing when no header', async () => {
    render(<PageLinkPicker {...defaultProps } />)

    await clickSelect()

    const expected = [
      '1 Text Image Left',
      '2 Icon Text Row',
      '3 Two Column Text'
    ]

    expected.forEach(e => expect(screen.getByText(e)).toBeInTheDocument())
  })
  
  it('renders selected from existing', async () => {
    render(<PageLinkPicker {...defaultProps } link={{ label: 'About', index: 1 }}/>)

    expect(screen.getByTestId('selected-1 Text Image Left')).toHaveTextContent('1 Text Image Left')
  })
  
  it('adds page link', async () => {
    render(<PageLinkPicker {...defaultProps } />)

    await clickSelect()
    await act(() => userEvent.click(screen.getByText('2 Icon Text Row')))

    await act(() =>
      userEvent.type(screen.getByRole('textbox', { name: /Label/ }), 'About')
    )

    await act(() => userEvent.click(screen.getByRole('button', { name: /Add/ })))

    expect(updateLinks).toBeCalledWith('About', 2)
  })

  it('updates page link', async () => {
    render(<PageLinkPicker {...defaultProps } link={{ label: 'About', index: 1 }}/>)

    await act(() => 
      userEvent.click(screen.getByTestId('remove-selected-1 Text Image Left'))
    )

    await act(() => userEvent.click(screen.getByText('2 Icon Text Row')))

    fireEvent.change(
      screen.getByRole('textbox', { name: /Label/ }),
      { target: { value: 'Contact' }}
    )

    await act(() => userEvent.click(screen.getByRole('button', { name: /Update/ })))

    expect(updateLinks).toBeCalledWith('Contact', 2)
  })
})