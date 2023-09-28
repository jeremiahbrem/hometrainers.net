import '@testing-library/jest-dom'
import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Page, Block, ComponentProps, PageProps } from '../types'
import { PageComponent } from '.'
import parse from 'html-react-parser'
import { RefreshProvider, useRefreshKey } from '../refresh'
import { AlertProvider } from '../alerts'
import { myUserEvent } from '@/utils/myUserEvent'

const originalContent = 'test body'
const newContent = 'new content'
const provider = 'auth'
const accessToken = 'test-token'

describe('PageComponent', () => {
  const Component: React.FC<ComponentProps<TestProps>> = ({ block, onUpdate }) => {
    const { refreshKey } = useRefreshKey()

    const onTextUpdate = async (text: string) => {
      onUpdate({
        ...block,
        text
      })
    }

    const onClick = () => {
      onTextUpdate(`<p>${newContent}</p>`)
    }

    return <div className='test-component'>
      {parse(block.text)}
      <span className='refresh-key'>{refreshKey}</span>
      <button onClick={onClick}>edit text</button>
    </div>
  }
  
  const Blocks = {
    'test-block': Component
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders block not found message if blockName not found', () => {
    render(<Harness
      page={{ ...page, blocks: { blocks: [{blockName: 'foo' }] }}}
      Blocks={Blocks}
    />)

    expect(screen.getByText('Block foo not found')).not.toBeNull()
  })
  
  it('renders not found if empty page', () => {
    render(<Harness
      page={{ slug: '' } as Page}
      Blocks={Blocks}
    />)

    expect(screen.getByText('Sorry, the page you were looking for was not found')).not.toBeNull()
  })

  const assertContent = (expected: string): void => {
    const content = document.querySelector('.test-component p') as HTMLElement
    expect(content).toHaveTextContent(expected)
  }

  describe('rendering component', () => {
    let rerender: (ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>) => void

    beforeEach(() => {
      mockUsePathname.mockImplementation(() => "my-page")

    rerender = render(<Harness
        page={page}
        Blocks={Blocks}
      />).rerender
    })

    it('renders with save popup hidden', () => {
      const popup = screen.getByTestId('page-saver')

      expect(popup.style.bottom).toBe('-5.5rem')
    })
  
    it('updates context content when editor updated', async () => {
      assertContent(originalContent)

      await act(() => userEvent.click(screen.getByRole('button', { name: /edit text/ })))

      assertContent(newContent)
    })
    
    it('shows save popup on edit', async () => {
      await act(() => userEvent.click(screen.getByRole('button', { name: /edit text/ })))

      const popup = screen.getByTestId('page-saver')

      expect(popup.style.bottom).toBe('0px')
    })

    describe('on reset', () => {
      let initialRefreshKey: string

      beforeEach(async () => {
        initialRefreshKey = document.querySelector('.refresh-key')!.textContent!

        await act(() => userEvent.click(screen.getByRole('button', { name: /edit text/ })))

        await act(() => userEvent.click(screen.getByRole('button', { name: /Reset/ })))
      })

      it('restores content', async () => {
        assertContent(originalContent)
      })
      
      it('closes popup', async () => {
        const popup = screen.getByTestId('page-saver')

        expect(popup.style.bottom).toBe('-5.5rem')
      })
      
      it('resets refresh key', async () => {
        const refreshKey = document.querySelector('.refresh-key')!.textContent

        expect(refreshKey).not.toBe(initialRefreshKey)
      })
      
      it('closes popup', async () => {
        const popup = screen.getByTestId('page-saver')
        
        expect(popup.style.bottom).toBe('-5.5rem')
      })
    })
    
    describe('on save', () => {
      let initialRefreshKey: string

      beforeEach(async () => {
        jest.useFakeTimers()
        initialRefreshKey = document.querySelector('.refresh-key')!.textContent!

        await act(() => myUserEvent.click(screen.getByRole('button', { name: /edit text/ })))

        await act(() => myUserEvent.click(screen.getByRole('button', { name: /Save/ })))
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('submits to api', async () => {
        expect(global.fetch).toBeCalledWith(
          'http://localhost:8080/my-page',
          {
            body: JSON.stringify({
              ...page,
              blocks: { blocks: [{
                text: `<p>${newContent}</p>`,
                blockName: 'test-block'
              }]}
            }),
            headers: {
              authorization: `Bearer ${accessToken}`,
              'token-provider': provider,
            },
            method: 'POST'
          }
        )
      })

      it('keeps updated content', async () => {
        assertContent(newContent)
      })

      it('resets refresh key', async () => {
        const refreshKey = document.querySelector('.refresh-key')!.textContent

        expect(refreshKey).not.toBe(initialRefreshKey)
      })
      
      it('closes popup when updated page props equal new page context', async () => {
        rerender(<Harness
          page={{
            ...page,
            blocks: { blocks: [
              { text: `<p>${newContent}</p>`, blockName: 'test-block' } as Block
            ]} }}
          Blocks={Blocks}
        />)

        const popup = screen.getByTestId('page-saver')

        expect(popup.style.bottom).toBe('-5.5rem')
      })
      
      it('shows success alert', async () => {
        expect(screen.getByText('Page updated!')).not.toBeNull()        
      })
      
      it('closes success alert after timer', async () => {
        act(() => jest.advanceTimersByTime(3001))
        expect(screen.queryByText('Page updated!')).toBeNull()        
      })
    })
  })
})

const page: Page = {
  slug: 'test-page',
  email: 'test@example.com',
  title: 'Test Page',
  city: 'Memphis',
  active: true,
  blocks: { blocks: [{
    text: `<p>${originalContent}</p>`,
    blockName: 'test-block',
  } as Block]}
}

type TestProps = { text: string }

const Harness: React.FC<PageProps> = (props) => (
  <RefreshProvider>
    <AlertProvider>
      <PageComponent {...props} />
    </AlertProvider>
  </RefreshProvider>
)

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true
} as Response))

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

const mockSession = jest.fn(() => ({
  data: {
    accessToken,
    provider
  }
}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))