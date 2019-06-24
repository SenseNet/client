/**
 * @module FieldControls
 */
import React, { Component } from 'react'

import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import TextField from '@material-ui/core/TextField'
import { ReactChoiceFieldSetting } from '../ChoiceFieldSetting'

/**
 * Interface for CheckboxGroup state
 */
export interface CheckboxGroupState {
  value: any[]
}
/**
 * Field control that represents a Choice field. Available values will be populated from the FieldSettings.
 */
export class CheckboxGroup extends Component<ReactChoiceFieldSetting, CheckboxGroupState> {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props: CheckboxGroup['props']) {
    super(props)
    this.state = {
      value: this.props.value || this.props.defaultValue || [],
    }
    this.handleChange = this.handleChange.bind(this)
  }
  /**
   * set selected value
   */
  public handleChange = (event: React.ChangeEvent) => {
    const { value } = this.state
    // eslint-disable-next-line dot-notation
    const newValue = event.target['value']
    const checked = value
    const index = value.indexOf(newValue)
    if (this.props.allowMultiple) {
      if (index > -1) {
        checked.splice(index, 1)
      } else {
        checked.push(newValue)
      }
    } else {
      if (index > -1) {
        checked.splice(index, 1)
      } else {
        checked[0] = newValue
      }
    }
    this.setState({
      value: checked,
    })
    this.props.fieldOnChange(this.props.fieldName, checked as any)
  }
  /**
   * returns if an item is checked or not
   * @param {string} item
   */
  public isChecked(item: number | string) {
    let checked = false
    for (let i = 0; i < this.state.value.length; i++) {
      if (this.state.value[i].toString() === item.toString()) {
        checked = true
        break
      }
    }
    return checked
  }
  /**
   * render
   * @return {ReactElement} markup
   */
  public render() {
    switch (this.props.actionName) {
      case 'edit':
        return (
          <FormControl
            className={this.props.className}
            component={'fieldset' as 'div'}
            required={this.props.required}
            error={this.props.errorText !== undefined && this.props.errorText.length > 0}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props.options.map(option => {
                return (
                  <FormControlLabel
                    key={option.Value}
                    control={
                      <Checkbox
                        checked={this.isChecked(option.Value)}
                        onChange={this.handleChange}
                        value={option.Value.toString()}
                        disabled={this.props.readOnly}
                      />
                    }
                    label={option.Text}
                  />
                )
              })}
            </FormGroup>
            {this.props.allowExtraValue ? <TextField placeholder="Extra value" /> : null}
            <FormHelperText>{this.props.hintText}</FormHelperText>
            <FormHelperText>{this.props.errorText}</FormHelperText>
          </FormControl>
        )
      case 'new':
        return (
          <FormControl
            className={this.props.className}
            component={'fieldset' as 'div'}
            required={this.props.required}
            error={this.props.errorText !== undefined && this.props.errorText.length > 0}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props.options.map(option => {
                return (
                  <FormControlLabel
                    key={option.Value}
                    control={
                      <Checkbox
                        checked={this.isChecked(option.Value)}
                        onChange={this.handleChange}
                        value={option.Value.toString()}
                        disabled={this.props.readOnly}
                      />
                    }
                    label={option.Text}
                  />
                )
              })}
            </FormGroup>
            {this.props.allowExtraValue ? <TextField placeholder="Extra value" /> : null}
            <FormHelperText>{this.props.hintText}</FormHelperText>
            <FormHelperText>{this.props.errorText}</FormHelperText>
          </FormControl>
        )
      case 'browse':
        return this.props.value.length > 0 ? (
          <FormControl component={'fieldset' as 'div'} className={this.props.className}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props.value.map((value: unknown, index: number) => (
                <FormControl component={'fieldset' as 'div'} key={index}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={this.props.options.find(item => item.Value === value).Text}
                    control={<span />}
                    key={this.props.options.find(item => item.Value === value).Name}
                  />
                </FormControl>
              ))}
            </FormGroup>
          </FormControl>
        ) : null
      default:
        return this.props.value.length > 0 ? (
          <FormControl component={'fieldset' as 'div'} className={this.props.className}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props.value.map((value: unknown, index: number) => (
                <FormControl component={'fieldset' as 'div'} key={index}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={this.props.options.find(item => item.Value === value).Text}
                    control={<span />}
                    key={this.props.options.find(item => item.Value === value).Name}
                  />
                </FormControl>
              ))}
            </FormGroup>
          </FormControl>
        ) : null
    }
  }
}
