/**
 * @module ViewControls
 *
 */
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { Repository } from '@sensenet/client-core'
import { ControlSchema } from '@sensenet/control-mapper'
import { GenericContent } from '@sensenet/default-content-types'
import React, { Component, createElement, ComponentType } from 'react'
import { reactControlMapper } from '../ReactControlMapper'
import { ReactClientFieldSetting } from '../fieldcontrols/ClientFieldSetting'
import { styles } from './BrowseViewStyles'

/**
 * Interface for BrowseView properties
 */
export interface BrowseViewProps {
  content: GenericContent
  repository: Repository
  renderIcon?: (name: string) => JSX.Element
}
/**
 * Interface for BrowseView state
 */
export interface BrowseViewState {
  content: GenericContent
  schema: ControlSchema<ComponentType, ComponentType<ReactClientFieldSetting>>
  controlMapper: ReturnType<typeof reactControlMapper>
}

/**
 * View Control for browsing a Content, works with a single Content and based on the ReactControlMapper
 *
 * Usage:
 * ```html
 *  <BrowseView content={content} />
 * ```
 */
export class BrowseView extends Component<BrowseViewProps, BrowseViewState> {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props: any) {
    super(props)
    /**
     * @type {object}
     * @property {any} content selected Content
     * @property {any} schema schema object of the selected Content's Content Type
     */
    const controlMapper = reactControlMapper(this.props.repository)
    this.state = {
      content: this.props.content,
      schema: controlMapper.getFullSchemaForContentType(this.props.content.Type, 'browse'),
      controlMapper,
    }
  }
  /**
   * returns a value of an input
   * @param {string} name name of the input
   * @return {any} value of the input or null
   */
  public getFieldValue(name: string) {
    if (this.props.content[name]) {
      return this.props.content[name]
    } else {
      return null
    }
  }
  /**
   * render
   * @return {ReactElement} markup
   */
  public render() {
    const fieldSettings = this.state.schema.fieldMappings
    // const that = this
    return (
      <Grid container={true} spacing={2}>
        <div style={styles.container}>
          <Typography variant="h5" gutterBottom={true}>
            {this.props.content.DisplayName}
          </Typography>
          {fieldSettings.map(field => {
            return (
              <Grid item={true} xs={12} sm={12} md={12} lg={12} xl={12} key={field.fieldSettings.Name}>
                {createElement(
                  this.state.controlMapper.getControlForContentField(
                    this.props.content.Type,
                    field.fieldSettings.Name,
                    'browse',
                  ),
                  {
                    fieldName: field.fieldSettings.Name,
                    actionName: 'browse',
                    value: this.getFieldValue(field.fieldSettings.Name),
                    repository: this.props.repository,
                    renderIcon: this.props.renderIcon,
                    fieldOnChange: () => {
                      /** */
                    },
                  },
                )}
              </Grid>
            )
          })}
        </div>
      </Grid>
    )
  }
}
