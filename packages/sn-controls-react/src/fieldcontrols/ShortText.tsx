/**
 * @module FieldControls
 */
import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography'
import { ShortTextFieldSetting } from '@sensenet/default-content-types'
import { createStyles, InputBase, InputLabel, Theme, withStyles } from '@material-ui/core'
import { changeJScriptValue } from '../helpers'
import { ReactClientFieldSetting } from './ClientFieldSetting'

const ShortTextInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      'label + &': {
        marginTop: '9px',
      },
    },
    input: {
      width: '536px',
      borderRadius: 4,
      position: 'relative',
      backgroundColor: 'transparent',
      border:
        theme.palette.type === 'light' ? '1px solid rgba(	197, 197, 197, 0.87 )' : '1px solid rgba(		80, 80, 80, 0.87 )',
      padding: '10px 12px',
      transition: theme.transitions.create(['border-color']),
      '&:focus': {
        borderColor: theme.palette.primary.main,
      },
    },
  }),
)(InputBase)

/**
 * Field control that represents a ShortText field. Available values will be populated from the FieldSettings.
 */
export const ShortText: React.FC<ReactClientFieldSetting<ShortTextFieldSetting>> = props => {
  const [value, setValue] = useState(props.fieldValue || changeJScriptValue(props.settings.DefaultValue) || '')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    setValue(e.target.value)
    props.fieldOnChange && props.fieldOnChange(props.settings.Name, e.target.value)
  }

  switch (props.actionName) {
    case 'edit':
    case 'new':
      return (
        <>
          <InputLabel shrink htmlFor={props.settings.Name}>
            {props.settings.DisplayName}
          </InputLabel>
          <ShortTextInput
            name={props.settings.Name}
            id={props.settings.Name}
            placeholder={props.settings.DisplayName}
            value={value}
            required={props.settings.Compulsory}
            disabled={props.settings.ReadOnly}
            defaultValue={changeJScriptValue(props.settings.DefaultValue)}
            inputProps={{
              minLength: props.settings.MinLength,
              maxLength: props.settings.MaxLength,
              pattern: props.settings.Regex,
            }}
            onChange={handleChange}
          />
        </>
      )
    case 'browse':
    default:
      return props.fieldValue ? (
        <div>
          <Typography variant="caption" gutterBottom={true}>
            {props.settings.DisplayName}
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            {props.fieldValue}
          </Typography>
        </div>
      ) : null
  }
}
