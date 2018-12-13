import { TextField as MaterialTextField } from '@material-ui/core'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { TextField } from '../src/Components/Fields/TextField'

describe('TextField Component', () => {
  configure({ adapter: new Adapter() })

  it('Should be constructed', () => {
    shallow(
      <TextField
        fieldName="DisplayName"
        fieldSetting={{}}
        onQueryChange={() => {
          /**  */
        }}
      />,
    )
  })

  it('onQueryChanged() should be executed on input change', done => {
    const instance = shallow(
      <TextField
        fieldName="DisplayName"
        fieldSetting={{}}
        onQueryChange={(key, q, text) => {
          expect(key).toBe('DisplayName')
          expect(q.toString()).toBe("DisplayName:'*Alma*'")
          expect(text).toBe('Alma')
          done()
        }}
      />,
    )
    const input = instance.find(MaterialTextField)
    input.props().onChange({ currentTarget: { value: 'Alma' } })
  })

  it('onQueryChanged() should be executed on input change with an empty query if no value provided', done => {
    const instance = shallow(
      <TextField
        fieldName="DisplayName"
        fieldSetting={{}}
        onQueryChange={(key, q) => {
          expect(key).toBe('DisplayName')
          expect(q.toString()).toBe('')
          done()
        }}
      />,
    )
    const input = instance.find(MaterialTextField)
    input.props().onChange({ currentTarget: {} })
  })
})
