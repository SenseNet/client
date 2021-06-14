/**
 * @module FieldControls
 */
import { deepMerge } from '@sensenet/client-utils'
import { Editor } from '@sensenet/editor-react'
import { createStyles, FormHelperText, InputLabel, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import { changeTemplatedValue } from '../helpers'
import { ReactClientFieldSetting } from './client-field-setting'
import { defaultLocalization } from './localization'

const useStyles = makeStyles(() =>
  createStyles({
    richTextEditor: {},
  }),
)

type RichTextEditorClassKey = Partial<ReturnType<typeof useStyles>>

const getFieldValue = (rawValue?: string) => {
  let value

  if (rawValue === undefined) {
    return
  }

  try {
    value = JSON.parse(rawValue)
  } catch (_) {
    return rawValue
  }

  try {
    return value.editor ? JSON.parse(value.editor) : value.text
  } catch (_) {
    return value.text
  }
}

/**
 * Field control that represents a LongText field. Available values will be populated from the FieldSettings.
 */
export const RichTextEditor: React.FC<
  ReactClientFieldSetting & { classes?: RichTextEditorClassKey; fieldValue?: string | { text: string; editor: string } }
> = (props) => {
  const localization = deepMerge(defaultLocalization.richTextEditor, props.localization?.richTextEditor)

  const initialState =
    getFieldValue(props.fieldValue) ||
    (props.actionName === 'new' && changeTemplatedValue(props.settings.DefaultValue)) ||
    ''
  const classes = useStyles(props)

  switch (props.actionName) {
    case 'edit':
    case 'new':
      return (
        <div className={classes.richTextEditor}>
          <InputLabel shrink htmlFor={props.settings.Name} required={props.settings.Compulsory}>
            {props.settings.DisplayName}
          </InputLabel>
          <Editor
            content={initialState}
            autofocus={props.autoFocus}
            placeholder={props.settings.DisplayName}
            readOnly={props.settings.ReadOnly}
            onChange={({ editor }) => {
              props.fieldOnChange?.(props.settings.Name, {
                text: editor.getHTML(),
                editor: JSON.stringify(editor.getJSON()),
              })
            }}
          />
          {!props.hideDescription && <FormHelperText>{props.settings.Description}</FormHelperText>}
        </div>
      )
    case 'browse':
    default:
      return (
        <div>
          <Typography variant="caption" gutterBottom={true}>
            {props.settings.DisplayName}
          </Typography>
          {props.fieldValue ? (
            <div
              dangerouslySetInnerHTML={{
                __html: typeof props.fieldValue === 'string' ? props.fieldValue : props.fieldValue.text,
              }}
            />
          ) : (
            <Typography variant="body1" gutterBottom={true}>
              {localization.noValue}
            </Typography>
          )}
        </div>
      )
  }
}
