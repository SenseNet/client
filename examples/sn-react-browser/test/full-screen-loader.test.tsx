import { shallow } from 'enzyme'
import React from 'react'
import { FullScreenLoader } from '../src/components/full-screen-loader'

describe('The full screen loader instance', () => {
  it('should be rendered correctly', () => {
    expect(shallow(<FullScreenLoader />)).toMatchSnapshot()
  })
})
