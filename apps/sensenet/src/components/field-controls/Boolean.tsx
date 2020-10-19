/**
 * @module FieldControls
 */
import { changeTemplatedValue } from '@sensenet/controls-react'
import { FieldSetting } from '@sensenet/default-content-types'
import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import clsx from 'clsx'
import React, { useState } from 'react'
import { ReactClientFieldSetting } from './ClientFieldSetting'
import { Switcher } from './switcher'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    alignedCenter: {
      alignItems: 'center',
    },
  }),
)
/**
 * Field control that represents a Boolean field.
 */
export const BooleanComponent: React.FC<ReactClientFieldSetting<FieldSetting>> = (props) => {
  const initialState =
    props.fieldValue != null ? !!props.fieldValue : !!changeTemplatedValue(props.settings.DefaultValue)
  const [value, setValue] = useState(initialState)
  const classes = useStyles()

  const handleChange = () => {
    setValue(!value)
    props.fieldOnChange && props.fieldOnChange(props.settings.Name, !value)
  }

  switch (props.actionName) {
    case 'new':
    case 'edit':
      return (
        <FormControl
          className={clsx(classes.root, {
            [classes.alignedCenter]:
              props.settings.Name === 'Enabled' &&
              (props.repository?.schemas.isContentFromType(props.content, 'User') || props.actionName === 'new'),
          })}
          required={props.settings.Compulsory}
          disabled={props.settings.ReadOnly}>
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item style={{ paddingRight: '30px' }}>
                {props.settings.DisplayName}
              </Grid>
              <Grid item>
                <Switcher size="small" checked={value} onChange={handleChange} />
              </Grid>
            </Grid>
          </Typography>
        </FormControl>
      )
    case 'browse':
    default:
      return props.fieldValue != null ? (
        <FormControl
          className={clsx(classes.root, {
            [classes.alignedCenter]:
              props.repository?.schemas.isContentFromType(props.content, 'User') && props.settings.Name === 'Enabled',
          })}
          required={props.settings.Compulsory}
          disabled={props.settings.ReadOnly}>
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item style={{ paddingRight: '30px' }}>
                {props.settings.DisplayName}
              </Grid>
              <Grid item>
                <Switcher size="small" disabled checked={value} onChange={handleChange} />
              </Grid>
            </Grid>
          </Typography>
        </FormControl>
      ) : null
  }
}
