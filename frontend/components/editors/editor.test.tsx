import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import parse from 'html-react-parser'
import '@testing-library/jest-dom'
import { Editor } from '@/components/editors'
import { optionTexts } from './options'

const onSave = jest.fn()

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname();
  },
}))

const mockSession = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))

const initialContent = '<p>test content</p>'

describe('Editor', () => {
  it('renders hidden if not my page', () => {
    mockUsePathname.mockReturnValueOnce("other-page")
    mockSession.mockReturnValueOnce({ data: 'defined' })
    
    render(<Harness />)

    expect(document.querySelector('.editor')).toBeNull()
  })
  
  it('renders hidden if not logged in', () => {
    mockUsePathname.mockReturnValueOnce("my-page")
    mockSession.mockReturnValueOnce({ data: undefined })

    render(<Harness />)

    expect(document.querySelector('.editor')).toBeNull()
  })
  
  it('renders editor if my page and logged in', () => {
    mockUsePathname.mockReturnValueOnce("my-page")
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness />)

    expect(document.querySelector('.editor')).not.toBeNull()
  })
  
  it('renders all buttons by default', () => {
    mockUsePathname.mockReturnValueOnce("my-page")
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness />)

    optionTexts.forEach(t => expect(screen.getByText(t)).not.toBeNull())
  })
  
  it('renders filtered buttons', () => {
    mockUsePathname.mockReturnValueOnce("my-page")
    mockSession.mockReturnValueOnce({ data: true })

    render(<Harness options={['p', 'h1']} />)

    const displayed = ['paragraph', 'h1']
    const hidden = optionTexts.filter(x => !displayed.includes(x))

    displayed.forEach(t => expect(screen.getByText(t)).not.toBeNull())
    hidden.forEach(t => expect(screen.queryByText(t)).toBeNull())
  })
})

const Harness: React.FC<{ options?: string[] }> = ({ options }) => {
  const ref = useRef(null)

  return (<>
    <div ref={ref}>
      <h1>Component</h1>
      {parse(initialContent)}
    </div>
    <Editor
      onSave={onSave}
      content={initialContent}
      contentRef={ref}
      options={options}
    />
    </>
  )
}