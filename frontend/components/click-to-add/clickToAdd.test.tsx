import React from 'react'
import { ClickToAdd } from '.'
import { render, screen } from '@testing-library/react'

describe('click to add', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders if is editing and no value', () => {
    mockUsePathname.mockImplementation(() => 'my-page')
    mockSession.mockImplementation(() => ({ data: true }))

    render(<ClickToAdd {...{ value: '', text: 'text'}} />)

    expect(screen.getByText('Click to add text +')).not.toBeNull()
  })
  
  it('no render not editing', () => {
    render(<ClickToAdd {...{ value: 'content', text: 'text'}} />)

    expect(screen.queryByText('Click to add text +')).toBeNull()
  })
  
  it('no render if non-empty value', () => {
    mockUsePathname.mockImplementation(() => 'my-page')
    mockSession.mockImplementation(() => ({ data: true }))

    render(<ClickToAdd {...{ value: 'content', text: 'text'}} />)

    expect(screen.queryByText('Click to add text +')).toBeNull()
  })
})

const mockUsePathname = jest.fn()
  const mockRedirect = jest.fn()

  jest.mock('next/navigation', () => ({
    usePathname() {
      return mockUsePathname()
    },
    redirect() {
      return mockRedirect()
    }
  }))

  const mockSession = jest.fn(() => ({}))

  jest.mock('next-auth/react', () => ({
    useSession() {
      return mockSession()
    }
  }))

