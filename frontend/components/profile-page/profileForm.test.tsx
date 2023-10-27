import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AlertProvider } from '../alerts'
import { ProfileContext } from '../profile-provider'
import { Profile } from '../profile-provider/types'
import { API } from '@/api'
import { ProfileForm } from './ProfileForm'

const resetProfile = jest.fn()

const mockFetch = jest.fn()
global.fetch = mockFetch

const submit = async () => {
  await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))
}

const getInput = (name: RegExp)  => {
  return screen.getByRole('textbox', { name }) as HTMLInputElement
}

describe('ProfileForm', () => {
  const cityResponse = Promise.resolve(["Tulsa","Owasso"])

  beforeEach(() => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      json: () => cityResponse,
      ok: true
    } as Response))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const existing = {
    cities: ['Tulsa'],
    goals: ['Weight Loss', 'Flexibility'],
    name: 'Trainer Gal',
    email: 'trainer-gal@example.com',
    type: 'trainer',
    image: ''
  } as Profile

  it('renders with existing profile values', async () => {
    render(<Harness type='trainer' profile={existing} />)

    await act(async () => { await cityResponse })

    const nameInput = getInput(/Name/)
    expect(nameInput.value).toBe(existing.name)

    const selectedItems = [...existing.cities, ...existing.goals]
    selectedItems.forEach(x => {
      expect(screen.getByText(x)).toBeInTheDocument()
    })
  })
  
  it('shows fetched cities on search', async () => {
    render(<Harness type='trainer' profile={null} />)

    await act(async () => { await cityResponse })

    await act(() => userEvent.type(getInput(/Cities/), 'T'))
    expect(screen.getByText('Tulsa')).toBeInTheDocument()
  })
  
  it('submit with missing city shows error', async () => {
    render(<Harness type='trainer' profile={existing} />)

    await act(async () => { await cityResponse })

    const removeCity = screen.getByText(existing.cities[0])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeCity))

    await submit()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByText('At least one city required')).toBeInTheDocument()

    const cityInput = getInput(/Cities/)
    expect(cityInput.style.borderColor).toBe('red')
  })
  
  it('submit with missing goal shows error', async () => {
    render(<Harness type='trainer' profile={{...existing, goals: [] }} />)

    await act(async () => { await cityResponse })

    await submit()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByText('At least one goal required')).toBeInTheDocument()

    const cityInput = getInput(/Goals/)
    expect(cityInput.style.borderColor).toBe('red')
  })
  
  it('submits form values', async () => {
    render(<Harness type='trainer' profile={existing} />)

    await act(async () => { await cityResponse })

    mockFetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true
    } as Response))

    fireEvent.change(getInput(/Name/), { target: { value: 'New Name' }})
    
    const removeGoal = screen.getByText(existing.goals[1])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeGoal))
    
    const removeCity = screen.getByText(existing.cities[0])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeCity))

    await act(() => userEvent.type(getInput(/Cities/), 'new cIty'))
    await act(() => userEvent.click(screen.getByRole('button', { name: 'new cIty' })))

    await submit()

    expect(global.fetch).nthCalledWith(2,
      `${API}/update-profile`,
      {
        headers: expect.any(Object),
        method: 'POST',
        body: JSON.stringify({
          type: 'trainer',
          name: 'New Name',
          goals: [existing.goals[0]],
          cities: ['New City'],
          image: ''
        })
      }
    )
  })
})

jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: true }
  }
}))


type HarnessProps = {
  type: 'client' | 'trainer'
  profile?: Profile | null
}

const Harness: React.FC<HarnessProps> = ({
  type,
  profile
}) => (
  <AlertProvider>
    <ProfileContext.Provider value={{
      openAllowClose: jest.fn(),
      openDisallowClose: jest.fn(),
      resetProfile,
      profile: profile ?? null,
      profileLoading: false
    }}>
      <ProfileForm type={type} />
    </ProfileContext.Provider>
  </AlertProvider>
)