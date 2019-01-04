import { TextField } from '@material-ui/core'
import { SchemaStore } from '@sensenet/client-core/dist/Schemas/SchemaStore'
import { GenericContent, ReferenceFieldSetting, SchemaStore as defaultSchemas } from '@sensenet/default-content-types'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { ReferenceField } from '../src/Components/Fields/ReferenceField'

describe('ReferenceField Component', () => {
  configure({ adapter: new Adapter() })

  const schemaStore = new SchemaStore()
  schemaStore.setSchemas(defaultSchemas)
  const exampleSchema = schemaStore.getSchema(GenericContent)
  const exampleFieldSetting = exampleSchema.FieldSettings.find(f => f.Name === 'CreatedBy') as ReferenceFieldSetting

  it('Should be constructed', () => {
    shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={exampleFieldSetting}
        fetchItems={async () => []}
        onQueryChange={() => {
          /** */
        }}
      />,
    ).unmount()
  })

  it('Should be constructed with default Id', done => {
    shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={exampleFieldSetting}
        defaultValueIdOrPath={1}
        fetchItems={async fetchQuery => {
          expect(fetchQuery.toString()).toBe("Id:'1'")
          done()
          return [{ Id: 1, Name: 'a', Path: '', Type: 'Document' }]
        }}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
  })

  it('Should be constructed with default Path', done => {
    shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={exampleFieldSetting}
        defaultValueIdOrPath="Root/Example/A"
        fetchItems={async fetchQuery => {
          expect(fetchQuery.toString()).toBe("Path:'Root/Example/A'")
          done()
          return [{ Id: 1, Name: 'a', Path: '', Type: 'Document' }]
        }}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
  })

  it('Text change should trigger the fetchItems method', done => {
    const instance = shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={exampleFieldSetting}
        fetchItems={async fetchQuery => {
          expect(fetchQuery.toString()).toBe("(Name:'*a*' OR DisplayName:'*a*')")
          done()
          instance.unmount()
          return []
        }}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
    instance
      .find(TextField)
      .props()
      .onChange({
        target: { value: 'a' },
        persist: () => {
          /** */
        },
      })
  })

  it('Text change query should include the allowed types', done => {
    const fieldSetting = { ...exampleFieldSetting }
    fieldSetting.AllowedTypes = ['User', 'Task']
    const instance = shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={fieldSetting}
        fetchItems={async fetchQuery => {
          expect(fetchQuery.toString()).toBe("(Name:'*a*' OR DisplayName:'*a*') AND (TypeIs:User OR TypeIs:Task)")
          done()
          instance.unmount()
          return []
        }}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
    instance
      .find(TextField)
      .props()
      .onChange({
        target: { value: 'a' },
        persist: () => {
          /** */
        },
      })
  })

  it('Text change query should include the selection roots', done => {
    const fieldSetting = { ...exampleFieldSetting }
    fieldSetting.SelectionRoots = ['Root/A', 'Root/B']
    const instance = shallow(
      <ReferenceField<GenericContent>
        fieldName="CreatedBy"
        fieldSetting={fieldSetting}
        fetchItems={async fetchQuery => {
          expect(fetchQuery.toString()).toBe(
            '(Name:\'*a*\' OR DisplayName:\'*a*\') AND (InTree:"Root/A" OR InTree:"Root/B")',
          )
          done()
          instance.unmount()
          return []
        }}
        onQueryChange={() => {
          /** */
        }}
      />,
    )
    instance
      .find(TextField)
      .props()
      .onChange({
        target: { value: 'a' },
        persist: () => {
          /** */
        },
      })
  })
})
