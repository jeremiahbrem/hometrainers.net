import '@testing-library/jest-dom'
import { useRef, useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import parse from 'html-react-parser'
import { Editor } from '@/components/editors'
import { optionTexts } from './options'
import { RefreshProvider, useRefreshKey } from '../refresh'
import { userEvent } from '@testing-library/user-event'

const onSave = jest.fn()
const onColorChange = jest.fn()

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname();
  },
}))

const mockSession = jest.fn(() => ({}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

const initialContent = '<p>test content</p>'

describe('Editor', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders hidden if not my page', () => {
    mockSession.mockImplementation(() => ({ data: true }))
    mockUsePathname.mockImplementation(() => 'other-page')
    
    render(<Harness />)

    expect(document.querySelector('.editor')).toBeNull()
  })
  
  it('renders hidden if not logged in', () => {
    mockSession.mockImplementation(() => ({ data: false }))
    mockUsePathname.mockImplementation(() => 'my-page')

    render(<Harness />)

    expect(document.querySelector('.editor')).toBeNull()
  })
  
  it('renders editor if my page and logged in', () => {
    mockSession.mockImplementation(() => ({ data: true }))
    mockUsePathname.mockImplementation(() => 'my-page')

    render(<Harness />)

    expect(document.querySelector('.editor')).not.toBeNull()
  })
  
  it('renders hidden', () => {
    mockUsePathname.mockReturnValueOnce('my-page')
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness />)

    const editor = document.querySelector('.editor')! as HTMLDivElement
    expect(editor.style.display).toBe('none')
  })
  
  it('shows editor on component click', async () => {
    mockSession.mockImplementation(() => ({ data: true }))
    mockUsePathname.mockImplementation(() => 'my-page')

    render(<Harness />)

    const component = document.querySelector('.component')!
    await act(() => userEvent.click(component))

    const editor = document.querySelector('.editor')! as HTMLDivElement
    expect(editor.style.display).toBe('block')
  })
  
  it('closes editor on scrim click', async () => {
    mockSession.mockImplementation(() => ({ data: true }))
    mockUsePathname.mockImplementation(() => 'my-page')

    render(<Harness />)

    await act(() => userEvent.click(document.querySelector('.component')!))

    await act(() => userEvent.click(screen.getByTestId('editor-scrim')))

    const editor = document.querySelector('.editor')! as HTMLDivElement
    expect(editor.style.display).toBe('none')
  })
  
  it('renders all buttons by default', async () => {
    mockUsePathname.mockReturnValueOnce('my-page')
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness />)


    optionTexts.forEach(t => expect(screen.getByText(t)).not.toBeNull())
  })
  
  it('renders filtered buttons', () => {
    mockUsePathname.mockReturnValueOnce('my-page')
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness options={['p', 'h1']} />)

    const displayed = ['paragraph', 'h1']
    const hidden = optionTexts.filter(x => !displayed.includes(x))

    displayed.forEach(t => expect(screen.getByText(t)).not.toBeNull())
    hidden.forEach(t => expect(screen.queryByText(t)).toBeNull())
  })

  it('changes color', async () => {
    mockUsePathname.mockReturnValueOnce('my-page')
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness />)
    
    await act(() => userEvent.click(screen.getByText('color')))

    const colorInput = document.querySelector('#color-picker input')!
    fireEvent.change(colorInput, { target: { value: '#ffffff' }})

    expect(onColorChange).toBeCalledWith('#ffffff')
  })
  
  it('resets content when refresh key resets', async () => {
    mockSession.mockImplementation(() => ({ data: true }))
    mockUsePathname.mockImplementation(() => 'my-page')

    const Resetter: React.FC<{ setContent: React.Dispatch<string>}> = ({ setContent }) => {
      const { reset } = useRefreshKey()
      return <button onClick={() => {
        setContent('<p>new</p>')
        reset()
      }}>reset</button>
    }

    const TestHarness: React.FC = () => {
      const [content, setContent] = useState('<p>initial</p>')

      return (
        <RefreshProvider>
          <Harness {...{ content }} />
          <Resetter {...{ setContent }} />
        </RefreshProvider>
      )
    }

    render(<TestHarness />)

    await act(() => userEvent.click(screen.getByText('reset')))
    expect(document.querySelector('.tiptap')).toHaveTextContent('new')
  })
})

type HarnessProps = {
  options?: string[]
  content?: string
}

const Harness: React.FC<HarnessProps> = ({ options, content }) => {
  const ref = useRef(null)

  return (<>
    <div ref={ref} className='component'>
      <h1>Component</h1>
      {parse(initialContent)}
    </div>
    <Editor
      onUpdate={onSave}
      content={content ?? initialContent}
      contentRef={ref}
      options={options}
      color={'#3c3636'}
      onColorChange={onColorChange}
    />
  </>)
}