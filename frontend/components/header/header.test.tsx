import React from 'react'
import { render } from '@testing-library/react'
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
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders', () => {
    render(<Header />)
  })
})