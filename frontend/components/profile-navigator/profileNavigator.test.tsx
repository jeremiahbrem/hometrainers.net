import React from 'react'
import { ProfileNavigator } from '.'
import { render, screen } from '@testing-library/react'
import { ProfileContext } from '../profile-provider'
import { Profile } from '../profile-provider/types'

const mockSession = jest.fn(() => ({}))
const openDisallowClose = jest.fn()
const mockPush = jest.fn()

describe('ProfileNavigator', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders loading if logged in with profile loading', () => {
    mockSession.mockImplementationOnce(() => ({ data: true }))
    render(<Harness profileLoading={true} />)

    expect(screen.getByTestId('loading')).toHaveAttribute('data-open', 'true')
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument()
  })
  
  it('opens sign in if not logged in', () => {
    render(<Harness />)

    expect(openDisallowClose).toBeCalled()
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument()
  })
  
  it('redirects to profile page if profile', () => {
    render(<Harness profile={{ type: 'trainer' } as Profile} />)

    expect(mockPush).toBeCalledWith('/profiles/trainer')
  })
})

type HarnessProps = {
  profile?: Profile | null
  profileLoading?: boolean
}

const Harness: React.FC<HarnessProps> = ({ profile, profileLoading }) => (
  <ProfileContext.Provider value={{
    profile: profile ?? { email: 'test' } as Profile,
    profileLoading: profileLoading ?? false,
    openAllowClose: jest.fn(),
    openDisallowClose,
    resetProfile: jest.fn(),
  }}>
    <ProfileNavigator />
  </ProfileContext.Provider>
)

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: mockPush }
  }
}))
