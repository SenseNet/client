/**
 * @module FieldControls
 */
import MomentUtils from '@date-io/moment'
import { MaterialUiPickersDate, MuiPickersUtilsProvider, TimePicker as MUITimePicker } from '@material-ui/pickers'
import moment from 'moment'
import React, { Fragment } from 'react'
import { DateTimeFieldSetting } from '@sensenet/default-content-types'
import { ReactClientFieldSetting } from './ClientFieldSetting'

/**
 * Interface for TimePicker state
 */
export interface TimePickerState {
  value: string
}
/**
 * Field control that represents a DateTime field. Available values will be populated from the FieldSettings.
 */
export class TimePicker extends React.Component<ReactClientFieldSetting<DateTimeFieldSetting>, TimePickerState> {
  state: TimePickerState = {
    value: this.props.fieldValue || this.props.settings.DefaultValue || moment().toISOString(),
  }

  /**
   * handle changes
   * @param {MaterialUiPickersDate} date
   */
  public handleDateChange = (date: MaterialUiPickersDate) => {
    if (!date) {
      return
    }
    this.setState({
      value: moment.utc(date).toString(),
    })
    this.props.fieldOnChange && this.props.fieldOnChange(this.props.settings.Name, moment.utc(date))
  }

  public render() {
    const { value } = this.state
    switch (this.props.actionName) {
      case 'edit':
      case 'new':
        return (
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <Fragment>
              <MUITimePicker
                value={value}
                onChange={this.handleDateChange}
                label={this.props.settings.DisplayName}
                id={this.props.settings.Name as string}
                disabled={this.props.settings.ReadOnly}
                placeholder={this.props.settings.DisplayName}
                required={this.props.settings.Compulsory}
                fullWidth={true}
              />
            </Fragment>
          </MuiPickersUtilsProvider>
        )
      default:
        return this.props.fieldValue ? (
          <div>
            <label>{this.props.settings.DisplayName}</label>
            <p>{moment(this.props.fieldValue).format('HH:mm:ss')}</p>
          </div>
        ) : null
    }
  }
}
