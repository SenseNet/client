import { Select } from '@material-ui/core'
import { SchemaStore } from '@sensenet/client-core/dist/Schemas/SchemaStore'
import { SchemaStore as defaultSchemas, Task, User } from '@sensenet/default-content-types'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { TypeField } from '../src/Components/Fields/TypeField'

describe('TypeField component', () => {
  configure({ adapter: new Adapter() })

  const schemaStore = new SchemaStore()
  schemaStore.setSchemas(defaultSchemas)
  it('Should be constructed', () => {
    const instance = shallow(
      <TypeField
        types={[]}
        schemaStore={schemaStore}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
    expect(instance)
  })

  it('Should be constructed with custom menu items', () => {
    const instance = shallow(
      <TypeField
        types={[]}
        schemaStore={schemaStore}
        onQueryChange={() => {
          /** */
        }}
        getMenuItem={() => <div />}
      />,
    )
    expect(instance)
  })

  it('Select change should update the query', done => {
    const instance = shallow(
      <TypeField
        types={[User, Task]}
        schemaStore={schemaStore}
        onQueryChange={q => {
          expect(q.toString()).toBe('TypeIs:User')
          done()
        }}
      />,
    )
    const select = instance.find(Select)
    select.props().onChange({ target: { value: 'User' } })
  })

  it('Selecting multiple values should update the query', done => {
    const instance = shallow(
      <TypeField
        types={[User, Task]}
        schemaStore={schemaStore}
        onQueryChange={q => {
          expect(q.toString()).toBe('TypeIs:User OR TypeIs:Task')
          done()
        }}
      />,
    )
    const select = instance.find(Select)
    select.props().onChange({ target: { value: ['User', 'Task'] } })
  })
})
