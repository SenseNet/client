import React from 'react'
import IconButton from '@material-ui/core/IconButton/IconButton'

/**
 * Properties for Toggle Base component
 */
export interface ToggleBaseProps {
  /**
   * Determines if the button is toggled
   */
  isVisible: boolean

  /**
   * The title property of the button
   */
  title: string

  /**
   * Function to set the isVisible's value
   */
  setValue: (isVisible: boolean) => void
}

/**
 * Represents a base toggle component
 */
export const ToggleBase: React.FunctionComponent<ToggleBaseProps> = (props) => (
  <div style={{ display: 'inline-block' }}>
    <IconButton
      color={props.isVisible ? 'primary' : 'inherit'}
      title={props.title}
      onClick={() => props.setValue(!props.isVisible)}>
      {props.children}
    </IconButton>
  </div>
)
