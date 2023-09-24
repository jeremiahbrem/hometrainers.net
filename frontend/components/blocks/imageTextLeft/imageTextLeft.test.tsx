import React from 'react'
import { render, screen } from '@testing-library/react'
import { ImageTextLeft } from '.'

const props = {
  image: 'http://example.com',
  text: '<h1>test heading</h1><p>test body</p>',
}

describe('ImageTextLeft', () => {
  it("renders", () => {
    render(<ImageTextLeft {...props} />)

    const expected = [
      'test heading',
      'test body'
    ]

    expected.forEach(x => expect(screen.getByText(x)).toBeDefined())
  })
})