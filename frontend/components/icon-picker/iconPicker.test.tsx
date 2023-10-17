import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { IconPicker } from '.'

const onIconUpdate = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return '/my-page';
  },
}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: true }
  }
}))

describe('IconPicker', () => {
  it('adds icon', async () => {
    render(<IconPicker {...{
      icon: '',
      onIconUpdate,
      preview: false,
    }} />)

    await act(() => userEvent.click(screen.getByTestId('open-icon-picker')))
    await act(() => userEvent.type(screen.getByRole('textbox'), 'Health Metrics'))
    await act(() => userEvent.click(screen.getByTestId('update-icon')))

    expect(onIconUpdate).toBeCalledWith('Health Metrics')
  })
})
