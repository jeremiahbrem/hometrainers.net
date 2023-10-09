import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ProfileProvider, useProfile } from '.'

const mockSession = jest.fn(() => ({}))

const mockOnRouteChange = jest.fn()

jest.mock('next/router', () => ({
  useRouter() {
    return {
      replace() {},
      events: { on: mockOnRouteChange, off() {} }
    };
  },
}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

const mockRouter = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockRouter
    }
  }
}))

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true
} as Response))

const clickAllowClose = async () => {
  await act(() => userEvent.click(
    screen.getByRole('button', { name: /with allow close/ })
  ))
}

const clickDisallowClose = async () => {
  await act(() => userEvent.click(
    screen.getByRole('button', { name: /without allow close/ })
  ))
}

const clickScrim = async () => {
  await act(() => userEvent.click(screen.getByTestId('signin-scrim')))
}

const assertOpen = () => {
  const modal = screen.getByTestId('profile-modal')!
  expect(modal.style.left).toBe('0px')
}

const assertClosed = () => {
  const modal = screen.getByTestId('profile-modal')!
  expect(modal.style.left).toBe('-110vw')
}

const setupLoggedIn = () => {
  mockSession.mockImplementation(() => ({ data: true }))
}

const setupLoggedOut = () => {
  mockSession.mockImplementation(() => ({ data: false }))
}

describe('profile provider', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    setupLoggedOut()
  })

  it('renders hidden', () => {
    render(<Harness />)

    assertClosed()
  })
  
  it('redirects to profile page if no profile returned after login', async () => {
    const response = Promise.resolve({})

    global.fetch = jest.fn(() => Promise.resolve({
      json: () => response,
      ok: false
    } as Response))

    setupLoggedIn()

    render(<Harness />)

    await act(() => response)

    expect(mockRouter).toBeCalledWith('/profiles')
  })
  
  it('opens sign in on button click', async () => {
    render(<Harness />)

    await clickAllowClose()
    assertOpen()
  })
  
  it('closes on scrim click when allow close', async () => {
    render(<Harness />)

    await clickAllowClose()

    await clickScrim()
    assertClosed()
  })
  
  it('closes on route change', async () => {
    let callback: () => void

    mockOnRouteChange.mockImplementation((evt, cb) => {
      if (evt === 'routeChangeStart') {
        callback = cb
      }
    })

    render(<Harness />)

    await clickAllowClose()

    act(() => callback())

    assertClosed()
  })
  
  it('disallows close when allow close false and not logged in', async () => {
    render(<Harness />)

    await clickDisallowClose()

    await clickScrim()
    assertOpen()
  })
  
  it('closes when login updated', async () => {
    const response = Promise.resolve({})

    global.fetch = jest.fn(() => Promise.resolve({
      json: () => response,
      ok: true
    } as Response))

    const { rerender } = render(<Harness />)

    await clickDisallowClose()

    setupLoggedIn()

    rerender(<Harness />)

    await act(() => response)

    assertClosed()
  })
  
  it('shows sign in when logged out', async () => {
    render(<Harness />)

    await clickAllowClose()

    expect(screen.getByRole('button', { name: /Sign in/ })).not.toBeNull()
  })
  
  it('shows sign out when logged in', async () => {
    setupLoggedIn()

    render(<Harness />)

    await clickAllowClose()

    expect(screen.getByRole('button', { name: /Sign out/ })).not.toBeNull()
  })
  
  it('clears profile on logout', async () => {
    const response = Promise.resolve({ email: 'test' })

    global.fetch = jest.fn(() => Promise.resolve({
      json: () => response,
      ok: true
    } as Response))

    setupLoggedIn()

    const { rerender } = render(<Harness />)

    await act(() => response)

    expect(screen.getByText('Profile defined')).toBeInTheDocument()

    setupLoggedOut()

    act(() => rerender(<Harness />))

    expect(screen.queryByText('Profile defined')).not.toBeInTheDocument()
  })
})

const Child: React.FC = () => {
  const { openAllowClose, openDisallowClose, profile } = useProfile()

  return (
    <>
      <button onClick={openAllowClose}>
        show with allow close
      </button>
      
      <button onClick={openDisallowClose}>
        show without allow close
      </button>

      {profile && <p>Profile defined</p>}
    </>
  )
}

const Harness: React.FC = () => {
  return <ProfileProvider>
    <Child />
  </ProfileProvider>
}