import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BlockButton } from '.'

const mockSession = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

const mockPath = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockPath()
  }
}))

const setupIsEditing = () => {
  mockSession.mockImplementation(() => ({ data: true }))
  mockPath.mockImplementation(() => 'my-page')
}

const setupNotEditing = () => {
  mockSession.mockImplementation(() => ({ data: false }))
  mockPath.mockImplementation(() => 'other-page')
}

const onClick = jest.fn()
const onButtonChange = jest.fn()

const color = 'rgb(246, 246, 246)'

describe('block button', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  describe('when not editing', () => {

    const setup = (outlined: boolean) => {
      render(<BlockButton
        color={color}
        text={'Submit'}
        outlined={outlined}
        onButtonChange={onButtonChange}
        onClick={onClick}
      />)
    }

    beforeEach(() => {
      setupNotEditing()
    })

    it('calls on click', async () => {
      setup(false)
      await userEvent.click(screen.getByText('Submit'))
      expect(onClick).toBeCalled()
    })

    describe('not outlined', () => {
      beforeEach(() => {
        setup(false)
      })

      it('renders solid color', () => {
        const button = screen.getByRole('button')
        expect(button.style.backgroundColor).toBe(color)
        expect(button.style.color).toBe('white')
      })

      it('changes to transparent on hover', () => {
        const button = screen.getByRole('button')
        fireEvent.mouseOver(button)

        expect(button.style.backgroundColor).toBe('transparent')
        expect(button.style.color).toBe(color)
      })
      
      it('changes back to solid on mouse out', () => {
        const button = screen.getByRole('button')
        fireEvent.mouseOver(button)
        fireEvent.mouseOut(button)

        expect(button.style.backgroundColor).toBe(color)
        expect(button.style.color).toBe('white')
      })
    })

    describe('outlined', () => {
      beforeEach(() => {
        setup(true)
      })

      it('renders transparent color', () => {
        const button = screen.getByRole('button')
        expect(button.style.backgroundColor).toBe('transparent')
        expect(button.style.color).toBe(color)
      })

      it('changes to solid on hover', () => {
        const button = screen.getByRole('button')
        fireEvent.mouseOver(button)

        expect(button.style.backgroundColor).toBe(color)
        expect(button.style.color).toBe('white')
      })
      
      it('changes back to transparent on mouse out', () => {
        const button = screen.getByRole('button')
        fireEvent.mouseOver(button)
        fireEvent.mouseOut(button)

        expect(button.style.backgroundColor).toBe('transparent')
        expect(button.style.color).toBe(color)
      })
    })
  })

  describe('when editing', () => {
    beforeEach(() => {
      setupIsEditing()

      render(<BlockButton
        color={''}
        text={'Submit'}
        outlined={false}
        onButtonChange={onButtonChange}
        onClick={onClick}
      />)
    })

    it('does not fire onClick', async () => {
      await act(() => userEvent.click(screen.getByText('Submit')))
      expect(onClick).not.toBeCalled()
    })

    it('opens edit modal on click', async () => {
      await act(() => userEvent.click(screen.getByText('Submit')))
      expect(screen.getByRole('textbox', { name: 'Button Text' })).toBeInTheDocument()
    })
    
    it('changes color', async () => {
      await act(() => userEvent.click(screen.getByText('Submit')))

      const colorInput = document.querySelector('.color-picker input')!
      await act(() => fireEvent.change(colorInput, { target: { value: '#f6f6f6' }}))
      await act(() => userEvent.click(document.querySelector('.edit-button-close')!))

      expect(onButtonChange).toBeCalledWith('Submit', '#f6f6f6', false)
    })
    
    it('changes text', async () => {
      await act(() => userEvent.click(screen.getByText('Submit')))

      const textInput = screen.getByRole('textbox', { name: 'Button Text' })
      await act(() => fireEvent.change(textInput, { target: { value: 'Send' }}))
      await act(() => userEvent.click(document.querySelector('.edit-button-close')!))

      expect(onButtonChange).toBeCalledWith('Send', '', false)
    })
    
    it('changes outlined', async () => {
      await act(() => userEvent.click(screen.getByText('Submit')))

      await act(() => userEvent.click(document.querySelector('.toggle')!))
      await act(() => userEvent.click(document.querySelector('.edit-button-close')!))

      expect(onButtonChange).toBeCalledWith('Submit', '', true)
    })
  })
})