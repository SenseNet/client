/**
 * @module FieldControls
 */
import React, { Component } from 'react'

import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { GenericContent } from '@sensenet/default-content-types'
import { ReactClientFieldSetting, ReactClientFieldSettingProps } from '../ClientFieldSetting'
import { ReactChoiceFieldSetting } from '../ChoiceFieldSetting'

/**
 * Interface for DropDownList properties
 */
export interface DropDownListProps<T extends GenericContent, K extends keyof T>
  extends ReactClientFieldSettingProps<T, K>,
    ReactClientFieldSetting<T, K>,
    ReactChoiceFieldSetting<T, K> {}
/**
 * Interface for DropDownList state
 */
export interface DropDownListState<T extends GenericContent, K extends keyof T> {
  value: T[K]
}
/**
 * Field control that represents a Choice field. Available values will be populated from the FieldSettings.
 */
export class DropDownList<T extends GenericContent, K extends keyof T> extends Component<
  DropDownListProps<T, K>,
  DropDownListState<T, K>
> {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props: DropDownListProps<T, K>) {
    super(props)
    /**
     * @type {object}
     */
    this.state = {
      value: this.props['data-fieldValue'] || this.props.defaultValue || [],
    }
  }
  /**
   * sets the selected value in the state
   */
  public handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    this.setState({ value: event.target.value as any })
    this.props.onChange(this.props.name, event.target.value as any)
  }
  /**
   * returns selected options value
   */
  public getSelectedValue() {
    let selected
    this.props.options.map(option => {
      if (option.Selected) {
        selected = option.Value
      }
    })
    return selected
  }

  /**
   * returns selected options text by its value
   * @param {any} value
   */
  public getTextByValue(value: any) {
    let text = ''
    if (value) {
      this.props.options.map(option => {
        if (option.Value === value.toString()) {
          text = option.Text
        }
      })
    } else {
      this.props.options.map(option => {
        if (option.Selected) {
          text = option.Text
        }
      })
    }
    return text
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
            fullWidth={true}
            required={this.props.required}
            error={this.props.errorText && this.props.errorText.length > 0 ? true : false}>
            <InputLabel htmlFor={this.props.name as string}>{this.props.labelText}</InputLabel>
            <Select
              onChange={this.handleChange}
              inputProps={
                {
                  name: this.props.name,
                  id: this.props.name,
                } as any
              }
              value={this.state.value[0]}
              multiple={this.props.allowMultiple}
              autoWidth={true}
              fullWidth={true}>
              {this.props.options.map(option => {
                return (
                  <MenuItem key={option.Value} value={option.Value}>
                    {option.Text}
                  </MenuItem>
                )
              })}
            </Select>
            <FormHelperText>{this.props.hintText}</FormHelperText>
            <FormHelperText>{this.props.errorText}</FormHelperText>
          </FormControl>
        )
      case 'new':
        return (
          <FormControl
            fullWidth={true}
            required={this.props.required}
            error={this.props.errorText && this.props.errorText.length > 0 ? true : false}>
            <InputLabel htmlFor={this.props.name as string}>{this.props.labelText}</InputLabel>
            <Select
              onChange={this.handleChange}
              inputProps={
                {
                  name: this.props.name,
                  id: this.props.name,
                } as any
              }
              value={this.state.value as any}
              multiple={this.props.allowMultiple}
              autoWidth={true}
              fullWidth={true}>
              {this.props.options.map(option => {
                return (
                  <MenuItem key={option.Value} value={option.Value}>
                    {option.Text}
                  </MenuItem>
                )
              })}
            </Select>
            <FormHelperText>{this.props.hintText}</FormHelperText>
            <FormHelperText>{this.props.errorText}</FormHelperText>
          </FormControl>
        )
      case 'browse':
        return this.props['data-fieldValue'] ? (
          <FormControl component={'fieldset' as 'div'} className={this.props.className}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props['data-fieldValue'].map((value: any, index: number) => (
                <FormControl component={'fieldset' as 'div'} key={index}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={this.props.options.find(item => item.Value === value).Text}
                    control={<span />}
                    key={value}
                  />
                </FormControl>
              ))}
            </FormGroup>
          </FormControl>
        ) : null
      default:
        return this.props['data-fieldValue'] ? (
          <FormControl component={'fieldset' as 'div'} className={this.props.className}>
            <FormLabel component={'legend' as 'label'}>{this.props.labelText}</FormLabel>
            <FormGroup>
              {this.props['data-fieldValue'].map((value: any, index: number) => (
                <FormControl component={'fieldset' as 'div'} key={index}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    label={this.props.options.find(item => item.Value === value).Text}
                    control={<span />}
                    key={value}
                  />
                </FormControl>
              ))}
            </FormGroup>
          </FormControl>
        ) : null
    }
  }
}
