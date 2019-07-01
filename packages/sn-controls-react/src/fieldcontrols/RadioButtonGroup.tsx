/**
 * @module FieldControls
 */
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import React, { Component } from 'react'
import { ChoiceFieldSetting } from '@sensenet/default-content-types'
import { ReactClientFieldSetting } from './ClientFieldSetting'

/**
 * Interface for RadioButton state
 */
export interface RadioButtonGroupState {
  value: string
}
/**
 * Field control that represents a Choice field. Available values will be populated from the FieldSettings.
 */
export class RadioButtonGroup extends Component<ReactClientFieldSetting<ChoiceFieldSetting>, RadioButtonGroupState> {
  constructor(props: RadioButtonGroup['props']) {
    super(props)
    this.state = {
      value:
        (this.props.content && this.props.content[this.props.settings.Name]) || this.props.settings.DefaultValue || '',
    }
  }
  /**
   * set selected value
   */
  public handleChange = (_event: React.ChangeEvent<{}>, value: string) => {
    this.setState({ value })
    this.props.fieldOnChange && this.props.fieldOnChange(this.props.settings.Name, value)
  }

  public render() {
    switch (this.props.actionName) {
      case 'edit':
      case 'new':
        return (
          <FormControl component={'fieldset' as 'div'} fullWidth={true} required={this.props.settings.Compulsory}>
            <FormLabel component={'legend' as 'label'}>{this.props.settings.DisplayName}</FormLabel>
            <RadioGroup
              aria-label={this.props.settings.DisplayName}
              name={this.props.settings.Name}
              value={this.state.value}
              onChange={this.handleChange}>
              {this.props.settings.Options &&
                this.props.settings.Options.map(option => {
                  return (
                    <FormControlLabel
                      key={option.Value}
                      value={option.Value.toString()}
                      control={<Radio />}
                      label={option.Text}
                      disabled={this.props.settings.ReadOnly}
                    />
                  )
                })}
            </RadioGroup>
            <FormHelperText>{this.props.settings.Description}</FormHelperText>
          </FormControl>
        )
      case 'browse':
      default: {
        const value = this.props.content && this.props.content[this.props.settings.Name]
        return value ? (
          <FormControl component={'fieldset' as 'div'}>
            <FormLabel component={'legend' as 'label'}>{this.props.settings.DisplayName}</FormLabel>
            <FormGroup>
              {Array.isArray(value) ? (
                value.map((val: any, index: number) => (
                  <FormControl component={'fieldset' as 'div'} key={index}>
                    <FormControlLabel
                      style={{ marginLeft: 0 }}
                      label={this.props.settings.Options!.find(item => item.Value === val)!.Text}
                      control={<span />}
                      key={val}
                    />
                  </FormControl>
                ))
              ) : (
                <FormControl component={'fieldset' as 'div'}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={this.props.settings.Options!.find(item => item.Value === value)!.Text}
                    control={<span />}
                  />
                </FormControl>
              )}
            </FormGroup>
          </FormControl>
        ) : null
      }
    }
  }
}
