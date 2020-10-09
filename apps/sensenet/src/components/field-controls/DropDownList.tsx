/**
 * @module FieldControls
 */
import { changeTemplatedValue } from '@sensenet/controls-react'
import { ChoiceFieldSetting } from '@sensenet/default-content-types'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import React, { useState } from 'react'
import { ReactClientFieldSetting } from './ClientFieldSetting'

/**
 * Field control that represents a Choice field. Available values will be populated from the FieldSettings.
 */
export const DropDownList: React.FC<ReactClientFieldSetting<ChoiceFieldSetting>> = (props) => {
  const getInitialstate = () => {
    if (!props.fieldValue) {
      if (props.settings.DefaultValue) {
        return props.settings.AllowMultiple
          ? changeTemplatedValue(props.settings.DefaultValue)!.split(/,|;/)
          : changeTemplatedValue(props.settings.DefaultValue)
      }

      if (props.settings.Options?.length) {
        return props.settings.AllowMultiple
          ? props.settings.Options.reduce<string[]>((selection, option) => {
              if (option.Selected) {
                selection.push(option.Value)
              }
              return selection
            }, [])
          : props.settings.Options.find((option) => option.Selected)?.Value ?? ''
      }
      return props.settings.AllowMultiple ? [''] : ''
    }
    if (!Array.isArray(props.fieldValue)) {
      return props.settings.AllowMultiple ? [props.fieldValue] : props.fieldValue
    }
    return props.fieldValue
  }
  const [value, setValue] = useState(getInitialstate)

  const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    setValue(event.target.value as any)
    props.fieldOnChange?.(
      props.settings.Name,
      Array.isArray(event.target.value) ? event.target.value : [event.target.value],
    )
  }

  switch (props.actionName) {
    case 'new':
    case 'edit':
      return (
        <FormControl fullWidth={true} required={props.settings.Compulsory} disabled={props.settings.ReadOnly}>
          <InputLabel htmlFor={props.settings.Name}>{props.settings.DisplayName}</InputLabel>
          <Select
            onChange={handleChange}
            inputProps={
              {
                name: props.settings.Name,
                id: props.settings.Name,
              } as any
            }
            value={value}
            name={props.settings.Name}
            multiple={props.settings.AllowMultiple}
            autoWidth={true}
            fullWidth={true}>
            {props.settings.Options?.map((option) => {
              return (
                <MenuItem key={option.Value} value={option.Value} selected={option.Selected}>
                  {option.Text}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      )
    case 'browse':
    default: {
      return props.fieldValue ? (
        <FormControl component={'fieldset' as 'div'}>
          <FormLabel component={'legend' as 'label'}>{props.settings.DisplayName}</FormLabel>
          <FormGroup>
            {Array.isArray(props.fieldValue) ? (
              props.fieldValue.map((val: any, index: number) => (
                <FormControl component={'fieldset' as 'div'} key={index}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={props.settings.Options?.find((item) => item.Value === val)?.Text ?? ''}
                    control={<span />}
                    key={val}
                  />
                </FormControl>
              ))
            ) : (
              <FormControl component={'fieldset' as 'div'}>
                <FormControlLabel
                  style={{ marginLeft: 0 }}
                  label={props.settings.Options?.find((item) => item.Value === props.fieldValue)?.Text ?? ''}
                  control={<span />}
                />
              </FormControl>
            )}
          </FormGroup>
        </FormControl>
      ) : (
        <FormLabel component={'legend' as 'label'}>{props.settings.DisplayName}</FormLabel>
      )
    }
  }
}
