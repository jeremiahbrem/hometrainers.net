import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MyPageComponent, MyPageComponentProps } from '.'
import { ComponentProps } from '../types'
import { RefreshProvider } from '../refresh'
import { AlertProvider } from '../alerts'
import { ProfileContext } from '../profile-provider'
import { Profile } from '../profile-provider/types'
import { API } from '@/api'

const page = {
  blocks: { blocks: []},
  slug: 'slug',
  email: 'email',
  title: 'title',
  description: 'descrip',
  active: true,
  images: []
}

describe('my page component', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it('does not fetch page if not logged', () => {
    render(<Harness Blocks={{}} PreviewBlocks={[]} />)

    expect(global.fetch).not.toBeCalled()
  })
  
  describe('page rendering', () => {
    beforeEach(() => {
      mockUsePathname.mockImplementation(() => 'my-page')
      mockSession.mockImplementation(() => ({ data: true }))
    })

    it('shows loading when fetch pending', () => {
      mockFetch.mockImplementation(() => new Promise(() => undefined))
      render(<Harness Blocks={{}} PreviewBlocks={[]} />)
  
      const loading = screen.getByTestId('loading')
      expect(loading).toHaveAttribute('data-open', 'true')
    })
    
    it('does not fetch if profile loading', () => {
      render(<Harness Blocks={{}} PreviewBlocks={[]} profileLoading={true} />)
  
      expect(mockFetch).not.toHaveBeenCalled()
    })
    
    it('stops loading when fetch resolves', async () => {
      const response = Promise.resolve({ json() {} })
      mockFetch.mockImplementation(() => response)
      render(<Harness Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)
  
      screen.queryAllByTestId('loading')!.forEach(x => {
        expect(x).toHaveAttribute('data-open', 'false')
      })
    })

    it('renders block selector button', async () => {
      const response = Promise.resolve({
        ok: true,
        json() {
          return {
            ...page,
            slug: '',
            blocks: { blocks: []},
          }
        }
      })

      mockFetch.mockImplementation(() => response)

      render(<Harness Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)

      expect(screen.getByRole('button', { name: /Add Block/ })).not.toBeNull()
    })
    
    it('renders with block selector closed', async () => {
      const response = Promise.resolve({
        ok: true,
        json() {
          return {
            ...page,
            blocks: { blocks: []},
          }
        }
      })

      mockFetch.mockImplementation(() => response)

      render(<Harness Blocks={{}} PreviewBlocks={[]} />)

      await act(() => response)

      const blockSelector = screen.getByTestId('block-selector')! as HTMLDivElement
      expect(blockSelector.style.display).toBe('none')
    })
    
    it('renders existing blocks', async () => {
      const response = Promise.resolve({
        ok: true,
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

      render(<Harness
        Blocks={{ 'test-block': Component }}
        PreviewBlocks={[]}
      />)

      await act(() => response)

      expect(screen.getByText('test text')).not.toBeNull()
    })
    
    it('shows error alert if fetch error', async () => {
      const response = Promise.resolve({
        ok: false,
        json() {
          return { error: "Server error"}
        }
      })

      mockFetch.mockImplementation(() => response)

      const Component: React.FC<ComponentProps<{ text: string}>> = (props) => {
        return <>test</>
      }

      render(<AlertProvider>
        <Harness
          Blocks={{ 'test-block': Component }}
          PreviewBlocks={[]}
        />
      </AlertProvider>)

      await act(() => response)

      expect(screen.getByText('Server error')).not.toBeNull()
    })
  })

  describe('page settings', () => {
    beforeEach(() => {
      mockUsePathname.mockImplementation(() => 'my-page')
      mockSession.mockImplementation(() => ({ data: true }))
    })

    const response = Promise.resolve({
      json() { return page }
    })

    beforeEach(async () => {
      mockFetch.mockImplementation(() => response)

      render(
        <RefreshProvider>
          <Harness
            Blocks={{}}
            PreviewBlocks={[]}
          />
        </RefreshProvider>
      )

      await act(() => response)
    })

    it('renders with settings closed', async () => {
      const settings = screen.getByTestId('page-settings') as HTMLDivElement
      expect(settings.style.left).toBe('-10.5rem')
    })

    it('opens settings', async () => {
      await act(() => userEvent.click(document.querySelector('#open-settings')!))

      const settings = screen.getByTestId('page-settings') as HTMLDivElement
      expect(settings.style.left).toBe('0px')
    })
    
    it('closes settings', async () => {
      await act(() => userEvent.click(document.querySelector('#open-settings')!))
      await act(() => userEvent.click(document.querySelector('#open-settings')!))

      const settings = screen.getByTestId('page-settings') as HTMLDivElement
      expect(settings.style.left).toBe('-10.5rem')
    })

    it('renders with page values', () => {
      const slugField = screen.getByRole('textbox', { name: /Slug/ }) as HTMLInputElement

      expect(slugField.value).toBe(page.slug)
    })
    
    it('updates settings', async () => {
      await act(() => userEvent.click(document.querySelector('#open-settings')!))
      await act(() => userEvent.click(screen.getByRole('checkbox', { name: /Active/ })))
      await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))

      expect(mockFetch).nthCalledWith(2,
        `${API}/my-page`,
        {
          body: JSON.stringify({
            ...page,
            active: !page.active,
          }),
          headers: expect.any(Object),
          method: 'POST'
        }
      )
    })
    
    it('ignores fetch and opens settings if empty required field on save', async () => {
      await act(() => userEvent.click(document.querySelector('#open-settings')!))
      await act(() => fireEvent.change(
        screen.getByRole('textbox', { name: /Title/ }), { target: { value: '' }}
      ))
      await act(() => userEvent.click(document.querySelector('#open-settings')!))
      await act(() => userEvent.click(document.querySelector('#open-settings')!))

      await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))

      expect(mockFetch).toBeCalledTimes(1)

      const settings = screen.getByTestId('page-settings') as HTMLDivElement
      expect(settings.style.left).toBe('0px')
      const titleInput = document.querySelector('#title')! as HTMLElement
      expect(titleInput.style.borderColor).toBe('red')
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
            <Harness
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
          `${API}/my-page`,
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
          `${API}/my-page`,
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
   
    describe('when saved with error', () => {
      const saveResponse = Promise.resolve({
        ok: false,
        json() {
          return { error: "Server error" }
        }
      })

      beforeEach(async () => {
        mockFetch.mockReturnValueOnce(saveResponse)

        await act(() => userEvent.click(screen.getByRole('button', { name: /Save/ })))
      })

      it('shows error alert', () => {
        expect(screen.getByText('Server error')).not.toBeNull()
      })
    })
  })
})

type HarnessProps = MyPageComponentProps & {
  profile?: Profile
  profileLoading?: boolean
}

const Harness: React.FC<HarnessProps> = (props) => {
  return (
    <ProfileContext.Provider value={{
      openAllowClose: () => undefined,
      openDisallowClose: () => undefined,
      resetProfile: () => Promise.resolve(),
      profile: props.profile ?? {
        email: 'email',
        cities: [],
        goals: [],
        type: 'trainer',
        name: 'name',
        image: '',
      },
      profileLoading: props.profileLoading ?? false,
    }}>
      <MyPageComponent {...props} />
    </ProfileContext.Provider>
  )
}

const mockFetch = jest.fn()

global.fetch = mockFetch

const mockUsePathname = jest.fn()
const mockRedirect = jest.fn()
const mockRouter = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname()
  },
  redirect() {
    return mockRedirect()
  },
  useRouter() {
    return { push: mockRouter }
  }
}))

const mockSession = jest.fn(() => ({}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))