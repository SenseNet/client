/**
 * @module FieldControls
 */
import React, { Component } from 'react'

import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Radium from 'radium'
import { ReactFileNameFieldSetting } from './FileNameFieldSetting'

/**
 * Interface for FileName state
 */
export interface FileNameState {
  value: string
  isValid: boolean
  error: string
  extension: string
}
/**
 * Field control that represents a ShortText field. Available values will be populated from the FieldSettings.
 */
@Radium
export class FileName extends Component<ReactFileNameFieldSetting, FileNameState> {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props: FileName['props']) {
    super(props)
    /**
     * @type {object}
     * @property {string} value input value
     */
    this.state = {
      value: this.setValue(this.props.value).toString(),
      isValid: this.props.required ? false : true,
      error: '',
      extension: this.props.extension
        ? this.props.extension
        : // eslint-disable-next-line dot-notation
        this.props['content']
        ? // eslint-disable-next-line dot-notation
          this.getExtensionFromValue(this.props['content'].Name)
        : this.props.value && this.props.value.indexOf('.') > -1
        ? this.getExtensionFromValue(this.props.value)
        : '',
    }

    this.handleChange = this.handleChange.bind(this)
  }
  /**
   * convert incoming default value string to proper format
   * @param {string} value
   */
  public setValue(value: string) {
    if (value) {
      return value
        .replace(/<[^>]*>/g, '')
        .split('.')
        .slice(0, -1)
        .join('.')
    } else {
      if (this.props.defaultValue) {
        return this.props.defaultValue
      } else {
        return ''
      }
    }
  }
  /**
   * Handles input changes. Dispatches a redux action to change field value in the state tree.
   * @param e
   */
  public handleChange(e: React.ChangeEvent) {
    const { fieldOnChange: onChange } = this.props
    // eslint-disable-next-line dot-notation
    const value = `${e.target['value']}.${this.state.extension}`
    onChange(this.props.fieldName, value as any)
  }

  /**
   * Returns an extension from a file name
   */
  public getExtensionFromValue = (filename: string) => {
    return filename.substr(filename.lastIndexOf('.') + 1)
  }
  /**
   * render
   * @return {ReactElement} markup
   */
  public render() {
    switch (this.props.actionName) {
      case 'edit':
        return (
          <TextField
            name={this.props.fieldName as string}
            id={this.props.fieldName as string}
            label={this.props.labelText}
            className={this.props.className}
            placeholder={this.props.placeHolderText}
            style={this.props.style}
            defaultValue={this.state.value}
            onChange={e => this.handleChange(e)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span>{`.${this.state.extension}`}</span>
                </InputAdornment>
              ),
            }}
            autoFocus={true}
            error={this.props.errorText && this.props.errorText.length > 0 ? true : false}
            required={this.props.required}
            disabled={this.props.readOnly}
            fullWidth={true}
            helperText={this.props.hintText}
          />
        )
      case 'new':
        return (
          <TextField
            name={this.props.fieldName as string}
            id={this.props.fieldName as string}
            label={this.props.labelText}
            className={this.props.className}
            placeholder={this.props.placeHolderText}
            style={this.props.style}
            defaultValue={this.state.value}
            onChange={e => this.handleChange(e)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span>{`.${this.props.extension}`}</span>
                </InputAdornment>
              ),
            }}
            autoFocus={true}
            error={this.props.errorText && this.props.errorText.length > 0 ? true : false}
            required={this.props.required}
            disabled={this.props.readOnly}
            fullWidth={true}
            helperText={this.props.hintText}
          />
        )
      case 'browse':
        return this.props.value && this.props.value.length > 0 ? (
          <div className={this.props.className}>
            <Typography variant="caption" gutterBottom={true}>
              {this.props.labelText}
            </Typography>
            <Typography variant="body1" gutterBottom={true}>
              {this.props.value}
            </Typography>
          </div>
        ) : null
      default:
        return this.props.value && this.props.value.length > 0 ? (
          <div className={this.props.className}>
            <Typography variant="caption" gutterBottom={true}>
              {this.props.labelText}
            </Typography>
            <Typography variant="body1" gutterBottom={true}>
              {this.props.value}
            </Typography>
          </div>
        ) : null
    }
  }
}
