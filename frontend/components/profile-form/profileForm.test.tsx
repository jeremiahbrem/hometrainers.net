import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ProfileForm } from '.'
import { AlertProvider } from '../alerts'
import { ProfileContext } from '../profile-provider'
import { Profile } from '../profile-provider/types'
import { API } from '@/api'

const resetProfile = jest.fn()

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true
} as Response))

const submit = async () => {
  await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))
}

const getInput = (name: RegExp)  => {
  return screen.getByRole('textbox', { name }) as HTMLInputElement
}

describe('ProfileForm', () => {
  const existing = {
    cities: ['Tulsa'],
    goals: ['Weight Loss', 'Flexibility'],
    name: 'Trainer Gal',
    email: 'trainer-gal@example.com',
    type: 'trainer',
    image: ''
  } as Profile

  it('renders with existing profile values', () => {
    render(<Harness type='trainer' profile={existing} />)

    const nameInput = getInput(/Name/)
    expect(nameInput.value).toBe(existing.name)

    const selectedItems = [...existing.cities, ...existing.goals]
    selectedItems.forEach(x => {
      expect(screen.getByText(x)).toBeInTheDocument()
    })
  })
  
  it('submit with missing name shows error', async () => {
    render(<Harness type='trainer' profile={existing} />)

    fireEvent.change(getInput(/Name/), { target: { value: '' }})

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Name required')).toBeInTheDocument()

    expect(getInput(/Name/).style.borderColor).toBe('red')
  })
  
  it('submit with missing city shows error', async () => {
    render(<Harness type='trainer' profile={existing} />)

    const removeCity = screen.getByText(existing.cities[0])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeCity))

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('At least one city required')).toBeInTheDocument()

    const cityInput = getInput(/Cities/)
    expect(cityInput.style.borderColor).toBe('red')
  })
  
  it('submit with missing goal shows error', async () => {
    render(<Harness type='trainer' profile={{...existing, goals: [] }} />)

    await submit()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('At least one goal required')).toBeInTheDocument()

    const cityInput = getInput(/Goals/)
    expect(cityInput.style.borderColor).toBe('red')
  })
  
  it('submits form values', async () => {
    render(<Harness type='trainer' profile={existing} />)

    fireEvent.change(getInput(/Name/), { target: { value: 'New Name' }})
    
    const removeGoal = screen.getByText(existing.goals[1])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeGoal))
    
    const removeCity = screen.getByText(existing.cities[0])!.nextElementSibling as HTMLButtonElement

    await act(() => userEvent.click(removeCity))

    await act(() => userEvent.type(getInput(/Cities/), 'new cIty'))
    await act(() => userEvent.click(screen.getByRole('button', { name: 'new cIty' })))

    await submit()

    expect(global.fetch).toHaveBeenCalledWith(
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