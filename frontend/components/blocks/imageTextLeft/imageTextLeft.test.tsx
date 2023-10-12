import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ImageTextLeft } from '.'
import { userEvent } from '@testing-library/user-event'

const onUpdate = jest.fn()
const addImage = jest.fn()
const removeImage = jest.fn()

const mockFetch = jest.fn()

global.fetch = mockFetch

const props = {
  block: {
    image: 'image-path',
    text: '<h1>test heading</h1><p>test body</p>',
    imageAlt: ''
  },
  onUpdate,
  addImage,
  removeImage,
}

const mockV4 = jest.fn()

jest.mock('uuid', () => ({
  v4() {
    return mockV4()
  }
}))

describe('ImageTextLeft', () => {
  it("renders", () => {
    render(<ImageTextLeft {...props} />)

    const expected = [
      'test heading',
      'test body'
    ]

    expected.forEach(x => expect(screen.getByText(x)).toBeDefined())
    expect(document.querySelector('.text')!.classList).not.toContain('right')

    const image = document.querySelector('img')!
    expect(image.getAttribute('src')).toContain('image-path')
  })

  it('adds image', async () => {
    const generatedId = 'test-path'

    mockUsePathname.mockImplementation(() => 'my-page')
    mockSession.mockImplementation(() => ({ data: true }))

    mockV4.mockImplementationOnce(() => generatedId)

    const fetchResponse = Promise.resolve({
      ok: true,
      json() {
        return {}
      }
    })

    mockFetch.mockImplementationOnce(() => fetchResponse)

    render(<ImageTextLeft {...{ ...props, block: { ...props.block, image: '' } }} />)

    const fileInput = screen.getByTestId('image-upload')
    
    const file = new File(['test file content'], 'test.txt', {
        type: 'text/plain',
    })

    await act(() => fireEvent.change(fileInput, { target: { files: [file] } }))

    const formData = new FormData();
 
    formData.append(
        "file",
        file,
        file.name,
    )

    formData.append('image-path', generatedId)

    expect(addImage).toHaveBeenCalledWith(generatedId)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/image',
      {
        method: 'POST',
        headers: expect.any(Object),
        body: formData,
      }
    )
  })
  
  it('removes image', async () => {
    mockUsePathname.mockImplementation(() => 'my-page')
    mockSession.mockImplementation(() => ({ data: true }))

    render(<ImageTextLeft {...props} />)

    await act(() => userEvent.click(screen.getByTestId('open-remove-image')))
    await act(() => userEvent.click(screen.getByRole('button', { name: /Remove/ })))

    expect(removeImage).toHaveBeenCalledWith(props.block.image)
  })
})

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname()
  },
}))

const mockSession = jest.fn(() => ({}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return mockSession()
  }
}))