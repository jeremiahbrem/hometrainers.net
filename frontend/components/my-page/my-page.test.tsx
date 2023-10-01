import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MyPageComponent } from '.'
import { ComponentProps } from '../types'
import { RefreshProvider } from '../refresh'
import { AlertProvider } from '../alerts'

const page = {
  blocks: { blocks: []},
  slug: 'slug',
  email: 'email',
  title: '',
  city: '',
  active: false,
}

describe('my page component', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it('does not fetch page if not logged', () => {
    render(<MyPageComponent Blocks={{}} PreviewBlocks={[]} />)

    expect(global.fetch).not.toBeCalled()
  })
  
  describe('page rendering', () => {
    beforeEach(() => {
      mockUsePathname.mockImplementation(() => 'my-page')
      mockSession.mockImplementation(() => ({ data: true }))
    })

    it('shows loading when fetch pending', () => {
      mockFetch.mockImplementation(() => new Promise(() => undefined))
      render(<MyPageComponent Blocks={{}} PreviewBlocks={[]} />)
  
      const loading = screen.getByTestId('loading')
      expect(loading).toHaveAttribute('data-open', 'true')
    })
    
    it('stops loading when fetch resolves', async () => {
      const response = Promise.resolve({ json() {} })
      mockFetch.mockImplementation(() => response)
      render(<MyPageComponent Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)
  
      screen.queryAllByTestId('loading')!.forEach(x => {
        expect(x).toHaveAttribute('data-open', 'false')
      })
    })

    it('renders block selector button', async () => {
      const response = Promise.resolve({
        json() {
          return {
            ...page,
            blocks: { blocks: []},
          }
        }
      })

      mockFetch.mockImplementation(() => response)

      render(<MyPageComponent Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)

      expect(screen.getByRole('button', { name: /Add Block/ })).not.toBeNull()
    })
    
    it('renders with block selector closed', async () => {
      const response = Promise.resolve({
        json() {
          return {
            ...page,
            blocks: { blocks: []},
          }
        }
      })

      mockFetch.mockImplementation(() => response)

      render(<MyPageComponent Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)

      const blockSelector = screen.getByTestId('block-selector')! as HTMLDivElement
      expect(blockSelector.style.display).toBe('none')
    })
    
    it('renders existing blocks', async () => {
      const response = Promise.resolve({
        json() {
          return {
            ...page,
            blocks: { blocks: [{
              blockName: 'test-block',
              text: 'test text',
            }]},
          }
        }
      })

      mockFetch.mockImplementation(() => response)

      const Component: React.FC<ComponentProps<{ text: string}>> = (props) => {
        return <>{props.block.text}</>
      }

      render(<MyPageComponent
        Blocks={{ 'test-block': Component }}
        PreviewBlocks={[]}
      />)

      await act(() => response)

      expect(screen.getByText('test text')).not.toBeNull()
    })

   
  })
  describe('adding new block', () => {
    beforeEach(() => {
      mockUsePathname.mockImplementation(() => 'my-page')
      mockSession.mockImplementation(() => ({ data: true }))
    })

    const response = Promise.resolve({
      json() {
        return {
          ...page,
          blocks: { blocks: [{
            blockName: 'test-block-1',
            text: 'test text1',
          }]},
        }
      }
    })

    const ExistingComponent: React.FC<ComponentProps<{ text: string}>> = (props) => {
      return <p>{props.block.text}</p>
    }
    
    const AddedComponent: React.FC<ComponentProps<{ text: string}>> = (props) => {
      return <>
        <p>{props.block.text}</p>
        {!props.block.text && <p>Click to add</p>}
      </>
    }

    beforeEach(async () => {
      mockFetch.mockImplementation(() => response)

      render(
        <AlertProvider>
          <RefreshProvider>
            <MyPageComponent
              Blocks={{
                'test-block-1': ExistingComponent,
                'test-block-2': AddedComponent
              }}
              PreviewBlocks={[
                {
                  Component: AddedComponent,
                  componentProps: {
                    block: { text: 'preview text' },
                    blockName: 'test-block-2',
                    preview: true,
                    onUpdate: () => undefined
                  },
                  newBlock: { blockName: 'test-block-2', text: '' },
                  testId: 'test-preview'
                }
              ]}
            />
          </RefreshProvider>
        </AlertProvider>
      )

      await act(() => response)

      await act(() => userEvent.click(screen.getByRole('button', { name: /Add Block/ })))

      await act(() => userEvent.click(screen.getByTestId('test-preview')))
    })
    
    it('adds block', async () => {
      expect(screen.getByText('Click to add')).not.toBeNull()
    })
    
    it('keeps existing blocks', async () => {
      expect(screen.getByText('test text1')).not.toBeNull()
    })
    
    it('resets', async () => {
      await act(() => userEvent.click(screen.getByRole('button', { name: /Reset/ })))

      expect(screen.queryByText('Click to add')).toBeNull()
    })

    describe('when saved', () => {
      const saveResponse = Promise.resolve({ json() {}, ok: true })
      const refetchResponse = Promise.resolve({
        ok: true,
        json() {
          return {
            ...page,
            blocks: { blocks: [
              {
                blockName: 'test-block-1',
                text: 'test text1',
              },
              {
                blockName: 'test-block-2',
                text: '',
              },
            ]},
          }
        }
      })

      beforeEach(async () => {
        mockFetch.mockReturnValueOnce(saveResponse)
        mockFetch.mockReturnValueOnce(refetchResponse)

        await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))
      })

      it('submits updated data', async () => {
        expect(mockFetch).nthCalledWith(2,
          'http://localhost:8080/my-page',
          {
            body: JSON.stringify({
              ...page,
              blocks: { blocks: [
                {
                  blockName: 'test-block-1',
                  text: 'test text1',
                },
                {
                  blockName: 'test-block-2',
                  text: '',
                },
              ]}
            }),
            headers: expect.any(Object),
            method: 'POST'
          }
        )
      })
      
      it('refetches', async () => {
        expect(mockFetch).nthCalledWith(3,
          'http://localhost:8080/my-page',
          {
            headers: expect.any(Object),
            method: 'GET'
          }
        )
      })

      it('closes save popup', () => {
        const popup = screen.getByTestId('page-saver')! as HTMLDivElement
        expect(popup.style.bottom).toBe('-5.5rem')
      })
      
      it('shows success alert', () => {
        expect(screen.getByText('Page updated!')).not.toBeNull()
      })
    })
  })
})

const mockFetch = jest.fn()

global.fetch = mockFetch

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