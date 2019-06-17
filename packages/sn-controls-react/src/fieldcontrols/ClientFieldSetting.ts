/**
 * @module FieldControls
 */
import { GenericContent } from '@sensenet/default-content-types'

/**
 * Interface for ReactClientFieldSetting properties
 */
export interface ReactClientFieldSettingProps<T extends GenericContent = GenericContent, K extends keyof T = 'Name'> {
  /**
   * Unique name of the field control
   */
  name: K
  /**
   * Called when the icon is clicked
   */
  onChange: (field: keyof T, value: string) => void
  /**
   * Unique key of the field control
   */
  key?: string
  /**
   * React style object
   */
  style?: object
  /**
   * Value of the field control
   */
  value?: any
  /**
   * Defining whether the field's data can be edited
   */
  readOnly?: boolean
  /**
   * Defining whether the field has to contain any data
   * @default false
   */
  required?: boolean
  /**
   * Additional class name
   * @default false
   */
  className?: string
}

/**
 * Interface for ClientFieldSetting properties
 */
export interface ReactClientFieldSetting<T extends GenericContent = GenericContent, K extends keyof T = 'Name'>
  extends ReactClientFieldSettingProps<T, K> {
  /**
   * Default value of the empty field control
   */
  defaultValue?: T[K] & { toString: () => string }
  /**
   * Display mode of the field control
   * @default browse
   */
  actionName?: 'new' | 'edit' | 'browse'
  /**
   * Text of the hint that could be displayed after the field control
   */
  hintText?: string
  /**
   * Text of the placeholder
   */
  'data-placeHolderText'?: string
  /**
   * Text of the label
   */
  'data-labelText'?: string
  /**
   * Text of the error message
   */
  'data-errorText'?: string
  /**
   * Name of the fieldcontrol type
   */
  'data-typeName'?: string
  /**
   * Url of the repository
   */
  'data-repositoryUrl'?: string
  /**
   * Function for rendering an icon by an iconname given as an input prop
   */
  'data-renderIcon'?: (name: string) => JSX.Element
}
