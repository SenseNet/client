/**
 * @module FieldControls
 */
import { GenericContent } from '@sensenet/default-content-types'
import { ReactShortTextFieldSetting } from '../ShortText/ShortTextFieldSetting'

/**
 * Interface for ColorPickerFieldSetting properties
 */
export interface ReactColorPickerFieldSetting<T extends GenericContent = GenericContent, K extends keyof T = 'Name'>
  extends ReactShortTextFieldSetting<T, K> {
  palette?: string[]
}
