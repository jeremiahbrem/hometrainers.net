import React from 'react'
import {
  PageComponent,
  addImage,
  onBackgroundChange,
  onRemove,
  onReorder,
  onUpdate,
  removeImage,
  updateAnchors
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
        text: 'test content',
        blockId: ''
      }]},
      slug: 'slug',
      email: 'email@example.com',
      title: '',
      description: '',
      active: false,
      images: []
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
          text: 'test content',
          blockId: ''
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
          text: 'initial text1',
          blockId: ''
        },
        {
          blockName: 'text2',
          text: 'initial text2',
          blockId: ''
        },
        {
          blockName: 'text3',
          text: 'initial text3',
          blockId: ''
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
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
            text: 'initial text1',
            blockId: ''
          },
          {
            blockName: 'text2',
            text: 'new text2',
            blockId: expect.any(String)
          },
          {
            blockName: 'text3',
            text: 'initial text3',
            blockId: ''
          },
        ]}
      })
    })
    
    it('updates page block background', () => {
      const blocks = [
        {
          blockName: 'text1',
          text: 'initial text1',
          blockId: ''
        },
        {
          blockName: 'text2',
          text: 'initial text2',
          blockId: ''
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }
  
      const result = onBackgroundChange('#FFFFFF', 1, initial, 'text2')
  
      expect(result).toEqual({
        ...initial,
        blocks: { blocks: [
          {
            blockName: 'text1',
            text: 'initial text1',
            blockId: ''
          },
          {
            blockName: 'text2',
            text: 'initial text2',
            background: '#FFFFFF',
            blockId: ''
          },
        ]}
      })
    })
    
    it('updates page context with addImage', () => {
      const initial: Page = {
        blocks: { blocks: [] },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: ['image1']
      }
  
      const result = addImage('image2', initial)
  
      expect(result).toEqual({
        ...initial,
        images: ['image1','image2']
      })
    })
   
    it('updates page context with removeImage', () => {
      const initial: Page = {
        blocks: { blocks: [] },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: ['image1']
      }
  
      const result = removeImage('image1', initial)
  
      expect(result).toEqual({
        ...initial,
        images: []
      })
    })
    
    it('updates page context with onRemove', () => {
      const blocks = [
        {
          blockName: 'text1',
          text: 'initial text1',
          blockId: ''
        },
        {
          blockName: 'text2',
          text: 'initial text2',
          blockId: ''
        },
        {
          blockName: 'text3',
          text: 'initial text3',
          blockId: ''
        },
      ].map(x => x as Block)
  
      const scenarios = [
        {
          index: 1,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
          ]
        },
        {
          index: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
          ]
        },
        {
          index: 2,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
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
        images: []
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
          text: 'initial text1',
          blockId: ''
        },
        {
          blockName: 'text2',
          text: 'initial text2',
          blockId: ''
        },
        {
          blockName: 'text3',
          text: 'initial text3',
          blockId: ''
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }
  
      const scenarios = [
        {
          order: 0,
          currentIndex: 1,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
          ]
        },
        {
          order: 1,
          currentIndex: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
          ]
        },
        {
          order: 0,
          currentIndex: 2,
          expected: [
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
          ]
        },
        {
          order: 2,
          currentIndex: 0,
          expected: [
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
          ]
        },
        {
          order: 1,
          currentIndex: 2,
          expected: [
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
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

    it('updates page context with onReorder when including header, footer', () => {
      const blocks = [
        {
          blockName: 'header',
          links: [],
        },
        {
          blockName: 'text1',
          text: 'initial text1',
          blockId: ''

        },
        {
          blockName: 'text2',
          text: 'initial text2',
          blockId: ''

        },
        {
          blockName: 'text3',
          text: 'initial text3',
          blockId: ''
        },
        {
          blockName: 'footer',
          links: [],
        },
      ].map(x => x as Block)
  
      const initial: Page = {
        blocks: { blocks },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }
  
      const scenarios = [
        {
          order: 0,
          currentIndex: 2,
          expected: [
            {
              blockName: 'header',
              links: []
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'footer',
              links: [],
            },
          ]
        },
        {
          order: 1,
          currentIndex: 1,
          expected: [
            {
              blockName: 'header',
              links: [],
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'footer',
              links: [],
            },
          ]
        },
        {
          order: 0,
          currentIndex: 3,
          expected: [
            {
              blockName: 'header',
              links: []
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'footer',
              links: [],
            },
          ]
        },
        {
          order: 2,
          currentIndex: 1,
          expected: [
            {
              blockName: 'header',
              links: []
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'footer',
              links: [],
            },
          ]
        },
        {
          order: 1,
          currentIndex: 3,
          expected: [
            {
              blockName: 'header',
              links: []
            },
            {
              blockName: 'text1',
              text: 'initial text1',
              blockId: ''
            },
            {
              blockName: 'text3',
              text: 'initial text3',
              blockId: ''
            },
            {
              blockName: 'text2',
              text: 'initial text2',
              blockId: ''
            },
            {
              blockName: 'footer',
              links: [],
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

    it('adds new anchor', () => {
      const blocks = [
        { blockName: 'header', links: [{ label: 'About', blockId: '1' }], blockId: '0' },
        { blockName: 'test-block', blockId: '1' }
      ]

      const old: Page = {
        blocks: { blocks: [
          { ...blocks[0], links: [] },
          blocks[1]
        ]},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const updated: Page = {
        blocks: { blocks },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const result = updateAnchors(
        old,
        updated,
        0
      )

      expect(result).toEqual({
        ...updated,
        blocks: { blocks: [
          { blockName: 'header', links: [{ label: 'About', blockId: '1' }], blockId: '0' },
          { blockName: 'test-block', anchors: ['About'], blockId: '1' }
        ]}
      })
    })
    
    it('removes anchor', () => {
      const blocks = [
        { blockName: 'header', links: [], blockId: '0' },
        { blockName: 'test-block', anchors: ['About'], blockId: '1' }
      ]

      const old: Page = {
        blocks: { blocks: [
          { ...blocks[0], links: [{ label: 'About', blockId: '1' }] },
          blocks[1]
        ]},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const updated: Page = {
        blocks: { blocks },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const result = updateAnchors(
        old,
        updated,
        0
      )

      expect(result).toEqual({
        ...updated,
        blocks: { blocks: [
          { blockName: 'header', links: [], blockId: '0' },
          { blockName: 'test-block', anchors: [], blockId: '1' }
        ]}
      })
    })
    
    it('replaces anchor', () => {
      const blocks = [
        { blockName: 'header', links: [{ label: 'About', blockId: '1' }], blockId: '0' },
        { blockName: 'test-block', anchors: ['About'], blockId: '1' }
      ]

      const old: Page = {
        blocks: { blocks: [
          { ...blocks[0], links: [{ label: 'About', blockId: '1' }] },
          blocks[1]
        ]},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const updated: Page = {
        blocks: { blocks: [
          { ...blocks[0], links: [{ label: 'Contact', blockId: '1' }] },
          blocks[1]
        ]},
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const result = updateAnchors(
        old,
        updated,
        0
      )

      expect(result).toEqual({
        ...updated,
        blocks: { blocks: [
          { blockName: 'header', links: [{ label: 'Contact', blockId: '1' }], blockId: '0' },
          { blockName: 'test-block', anchors: ['Contact'], blockId: '1' }
        ]}
      })
    })
    
    it('leaves anchor unchanged', () => {
      const blocks = [
        { blockName: 'header', links: [
          { label: 'About', blockId: '1' }
        ], blockId: '0' },
        { blockName: 'test-block', anchors: ['About'], blockId: '1' }
      ]

      const old: Page = {
        blocks: { blocks },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const updated: Page = {
        blocks: { blocks },
        slug: '',
        email: '',
        title: '',
        description: '',
        active: false,
        images: []
      }

      const result = updateAnchors(
        old,
        updated,
        0
      )

      expect(result).toEqual(updated)
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