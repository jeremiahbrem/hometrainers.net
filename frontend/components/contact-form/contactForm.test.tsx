import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AlertProvider } from '../alerts'
import { API } from '@/api'
import { ContactForm } from '.'

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true
} as Response))

const submit = async () => {
  await act(() => userEvent.click(screen.getByRole('button', { name: /Send/ })))
}

const getInput = (name: RegExp)  => {
  return screen.getByRole('textbox', { name }) as HTMLInputElement
}

describe('ContactForm', () => {
  it('submit with missing name shows error', async () => {
    render(<Harness />)

    await act(() => userEvent.type(getInput(/Email/), 'test@example.com'))
    await act(() => userEvent.type(getInput(/Message/), 'my message'))

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Name required')).toBeInTheDocument()

    expect(getInput(/Name/).style.borderColor).toBe('red')
  })
  
  it('submit with missing email shows error', async () => {
    render(<Harness />)

    await act(() => userEvent.type(getInput(/Name/), 'My Name'))
    await act(() => userEvent.type(getInput(/Message/), 'my message'))

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Email required')).toBeInTheDocument()

    expect(getInput(/Email/).style.borderColor).toBe('red')
  })
  
  it('submit with missing message shows error', async () => {
    render(<Harness />)

    await act(() => userEvent.type(getInput(/Email/), 'test@example.com'))
    await act(() => userEvent.type(getInput(/Name/), 'My Name'))

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Message required')).toBeInTheDocument()

    expect(getInput(/Message/).style.borderColor).toBe('red')
  })
  
  it('submits form values', async () => {
    render(<Harness />)

    await act(() => userEvent.type(getInput(/Name/), 'My Name'))
    await act(() => userEvent.type(getInput(/Email/), 'test@example.com'))
    await act(() => userEvent.type(getInput(/Message/), 'my message'))

    await submit()

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/contact`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Name',
          email: 'test@example.com',
          message: 'my message'
        })
      }
    )
  })
})

const Harness: React.FC = () => (
  <AlertProvider>
    <ContactForm />
  </AlertProvider>
)