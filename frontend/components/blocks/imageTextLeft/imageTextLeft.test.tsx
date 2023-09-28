import React from 'react'
import { render, screen } from '@testing-library/react'
import { ImageTextLeft } from '.'

const props = {
  block: {
    image: 'http://example.com',
    text: '<h1>test heading</h1><p>test body</p>',
  },
  onUpdate: () => undefined
}
  

describe('ImageTextLeft', () => {
  it("renders", () => {
    render(<ImageTextLeft {...props} />)

    const expected = [
      'test heading',
      'test body'
    ]

    expected.forEach(x => expect(screen.getByText(x)).toBeDefined())
    expect(document.querySelector('.text')!.classList).not.toContain('right')
  })
})