import React from 'react'
import {
  PageComponent,
  onRemove,
  onReorder,
  onUpdate
} from '.'
import { Block, ComponentProps, Page } from '../types'
import { BlockActions } from './blockActions'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

const mockOnRemove = jest.fn()
const mockOnReorder = jest.fn()

describe('page component', () => {
  describe('page rendering', () => {
    const Component: React.FC<ComponentProps<{ text: string }>> = (props) => {
      return <>{props.block.text}</>
    }

    const Blocks = {
      'text-block': Component
    }

    const page: Page = {
      blocks: { blocks: [{
        blockName: 'text-block',
        text: 'test content'
      }]},
      slug: 'slug',
      email: 'email@example.com',
      title: '',
      description: '',
      active: false,
    }

    it('renders component with content', () => {
      render(<PageComponent {...{
        page,
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.getByText('test content')).not.toBeNull()
    })
    
    it('renders not found with missing slug', () => {
      render(<PageComponent {...{
        page: {...page, slug: '' },
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.getByText(
        'Sorry, the page you were looking for was not found'
      )).not.toBeNull()
    })
    
    it('renders not found with missing email when editing', () => {
      mockUsePathname.mockReturnValueOnce('my-page')
      mockSession.mockReturnValueOnce({ data: true })

      render(<PageComponent {...{
        page: {...page, email: '' },
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.getByText(
        'Sorry, the page you were looking for was not found'
      )).not.toBeNull()
    })
    
    it('renders empty page when editing and no blocks', () => {
      mockUsePathname.mockReturnValueOnce('my-page')
      mockSession.mockReturnValueOnce({ data: true })
      
      render(<PageComponent {...{
        page: {...page, blocks: { blocks: [] }, email: 'test@example.com', slug: '' },
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.queryByText(
        'Sorry, the page you were looking for was not found'
      )).toBeNull()
    })
    
    it('renders missing block message', () => {
      render(<PageComponent {...{
        page: {...page, blocks: { blocks: [{
          blockName: 'other',
          text: 'test content'
        }]}, },
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.getByText(
        'Block other not found'
      )).not.toBeNull()
    })
    
    it('does not render block actions when not editing', () => {
      render(<PageComponent {...{
        page,
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.queryByRole('button', { name: /Reorder/ })).toBeNull()
    })
    
    it('renders block actions when editing', () => {
      mockUsePathname.mockReturnValueOnce('my-page')
      mockSession.mockReturnValueOnce({ data: true })

      render(<PageComponent {...{
        page,
        Blocks,
        setPageContext: jest.fn()
      }} />)

      expect(screen.getByRole('button', { name: /Reorder/ })).not.toBeNull()
    })
  })

  describe('page updating', () => {
    it('updates page context with onUpdate', () => {
      const blocks = [
        {
          blockName: 'text1',
          text: 'initial text1'
        },
        {
          blockName: 'text2',
          text: 'initial text2'
        },
        {
          blockName: 'text3',
          text: 'initial text3'
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
      }
  
      const newArgs = {
        text: 'new text2'
      }
  
      const result = onUpdate(newArgs, 1, initial, 'text2')
  
      expect(result).toEqual({
        ...initial,
        blocks: { blocks: [
          {
            blockName: 'text1',
            text: 'initial text1'
          },
          {
            blockName: 'text2',
            text: 'new text2'
          },
          {
            blockName: 'text3',
            text: 'initial text3'
          },
        ]}
      })
    })
    
    it('updates page context with onRemove', () => {
      const blocks = [
        {
          blockName: 'text1',
          text: 'initial text1'
        },
        {
          blockName: 'text2',
          text: 'initial text2'
        },
        {
          blockName: 'text3',
          text: 'initial text3'
        },
      ].map(x => x as Block)
  
      const scenarios = [
        {
          index: 1,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
          ]
        },
        {
          index: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
          ]
        },
        {
          index: 2,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text2',
              text: 'initial text2'
            },
          ]
        }
      ]
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
      }
  
      scenarios.forEach(({ index, expected }) => {
        const result = onRemove(index, initial)
  
        expect(result).toEqual({
          ...initial,
          blocks: { blocks: expected}
        })
      })
    })
    
    it('updates page context with onReorder', () => {
      const blocks = [
        {
          blockName: 'text1',
          text: 'initial text1'
        },
        {
          blockName: 'text2',
          text: 'initial text2'
        },
        {
          blockName: 'text3',
          text: 'initial text3'
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
      }
  
      const scenarios = [
        {
          order: 0,
          currentIndex: 1,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2'
            },
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
          ]
        },
        {
          order: 1,
          currentIndex: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2'
            },
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
          ]
        },
        {
          order: 0,
          currentIndex: 2,
          expected: [
            {
              blockName: 'text3',
              text: 'initial text3'
            },
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text2',
              text: 'initial text2'
            },
          ]
        },
        {
          order: 2,
          currentIndex: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
            {
              blockName: 'text1',
              text: 'initial text1'
            },
          ]
        },
        {
          order: 1,
          currentIndex: 2,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1'
            },
            {
              blockName: 'text3',
              text: 'initial text3'
            },
            {
              blockName: 'text2',
              text: 'initial text2'
            },
          ]
        },
      ]
  
      scenarios.forEach(({ order, currentIndex, expected }) => {
        const result = onReorder(order, initial, currentIndex)
  
        expect(result).toEqual({
          ...initial,
          blocks: { blocks: expected}
        })
      })
    })
  })

  describe('block actions', () => {
    const initialOrder = 0

    beforeEach(() => {
      render(<BlockActions {...{
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
        order: initialOrder
      }} />)
    })

    it('calls onRemove', async () => {
      await act(() => userEvent.click(screen.getByRole('button', { name: /Remove/ })))
      expect(mockOnRemove).toBeCalled()
    })

    it('renders with hidden form', () => {
      expect(screen.queryByRole('spinbutton')).toBeNull()
    })
    
    it('opens form', async () => {
      await act(() => userEvent.click(screen.getByRole('button', { name: /Reorder/ })))
      expect(screen.queryByRole('spinbutton')).not.toBeNull()
    })

    describe('on reorder submit', () => {
      const changeInput = async () => {
        await act(() => userEvent.click(screen.getByRole('button', { name: /Reorder/ })))
        await act(() => userEvent.type(screen.queryByRole('spinbutton')!, '{backspace}2'))
        await act(() => userEvent.click(screen.getByRole('button', { name: /Update/ })))
      }

      beforeEach(async() => await changeInput())

      it('calls reorder on submit', async () => {
        expect(mockOnReorder).toBeCalledWith(1)
      })
      
      it('closed form', async () => {
        expect(screen.queryByRole('spinbutton')).toBeNull()
      })
      
      it('restores original order value', async () => {
        await act(() => userEvent.click(screen.getByRole('button', { name: /Reorder/ })))
        expect((screen.queryByRole('spinbutton') as HTMLInputElement)!.value).toBe('1')
      })
    })
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