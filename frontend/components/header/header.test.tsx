import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Header from '.'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname()
  },
}))

const mockSession = jest.fn(() => ({}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

describe('header', () => {
  it('renders hidden', () => {
    render(<Header />)

    const modal = screen.getByTestId('sign-in-modal')!
    expect(modal.style.left).toBe('-110vw')
  })
  
  it('opens sign in on button click', async () => {
    render(<Header />)

    await act(() => userEvent.click(document.querySelector('#sign-in-button')!))
    const modal = screen.getByTestId('sign-in-modal')!
    expect(modal.style.left).toBe('0px')
  })
  
  it('opens sign in on my-page if logged out', async () => {
    mockUsePathname.mockReturnValueOnce('my-page')
    render(<Header />)

    const modal = screen.getByTestId('sign-in-modal')!
    expect(modal.style.left).toBe('0px')
  })
})