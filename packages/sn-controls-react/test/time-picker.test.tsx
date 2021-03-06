import Typography from '@material-ui/core/Typography'
import { TimePicker as MUITimePicker } from '@material-ui/pickers'
import format from 'date-fns/format'
import { shallow } from 'enzyme'
import React from 'react'
import { defaultLocalization, TimePicker } from '../src/fieldcontrols'

const value = '2001-09-11T08:46:00.000Z'
const defaultSettings = {
  Name: 'ModificationDate',
  Type: 'DateTimeFieldSetting',
  DisplayName: 'Modification Date',
  FieldClassName: 'SenseNet.ContentRepository.Fields.DateTimeField',
}

describe('Time picker field control', () => {
  describe('in browse view', () => {
    it('should show the displayname and fieldValue when fieldValue is provided', () => {
      const wrapper = shallow(<TimePicker fieldValue={value} actionName="browse" settings={defaultSettings} />)
      expect(wrapper.find(Typography).first().text()).toBe(defaultSettings.DisplayName)
      expect(wrapper.find(Typography).last().text()).toBe(format(new Date(value), 'HH:mm:ss'))
    })
    it('should show no value message when field value is not provided', () => {
      const wrapper = shallow(<TimePicker actionName="browse" settings={defaultSettings} />)
      expect(wrapper.find(Typography).last().text()).toBe(defaultLocalization.timePicker.noValue)
    })
  })
  describe('in edit/new view', () => {
    it('should set all the props', () => {
      const wrapper = shallow(
        <TimePicker
          fieldValue={value}
          actionName="edit"
          settings={{
            ...defaultSettings,
            ReadOnly: true,
            Compulsory: true,
          }}
        />,
      )
      expect(wrapper.find(MUITimePicker).prop('value')).toBe(value)
      expect(wrapper.find(MUITimePicker).prop('name')).toBe(defaultSettings.Name)
      expect(wrapper.find(MUITimePicker).prop('id')).toBe(defaultSettings.Name)
      expect(wrapper.find(MUITimePicker).prop('label')).toBe(defaultSettings.DisplayName)
      expect(wrapper.find(MUITimePicker).prop('placeholder')).toBe(defaultSettings.DisplayName)
      expect(wrapper.find(MUITimePicker).prop('required')).toBeTruthy()
      expect(wrapper.find(MUITimePicker).prop('disabled')).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })

    it('should set default value', () => {
      const wrapper = shallow(
        <TimePicker
          actionName="new"
          settings={{
            ...defaultSettings,
            DefaultValue: 'defaultValue',
          }}
        />,
      )

      expect(wrapper.find(MUITimePicker).prop('value')).toBe('defaultValue')
    })

    it('should call on change when input changes', () => {
      const fieldOnChange = jest.fn()
      const wrapper = shallow(<TimePicker actionName="edit" fieldOnChange={fieldOnChange} settings={defaultSettings} />)
      wrapper.find('PickerWithState').simulate('change', new Date(123234538324).toISOString())
      expect(fieldOnChange).toBeCalled()
    })
  })
})
