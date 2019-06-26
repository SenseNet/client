import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import { PathHelper } from '@sensenet/client-utils'
import { GenericContent, User, ReferenceFieldSetting } from '@sensenet/default-content-types'
import React, { Component } from 'react'
import { renderIconDefault } from '../icon'
import { ReactClientFieldSetting } from '../ClientFieldSetting'
import { AvatarPicker } from './AvatarPicker'
import { DefaultAvatarTemplate } from './DefaultAvatarTemplate'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  dialog: {
    padding: 20,
    minWidth: 250,
  },
  listContainer: {
    display: 'block',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  icon: {
    marginRight: 0,
  },
}

const AVATAR_PICKER_TITLE = 'Avatar picker'
const OK = 'Ok'
const CANCEL = 'Cancel'
const DEFAULT_AVATAR_PATH = '/Root/Sites/Default_Site/demoavatars/Admin.png'

/**
 * Interface for Avatar state
 */
export interface AvatarState {
  fieldValue: any
  pickerIsOpen: boolean
  selected?: GenericContent
}

export class Avatar extends Component<ReactClientFieldSetting<ReferenceFieldSetting, User>, AvatarState> {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props: Avatar['props']) {
    super(props)
    this.state = {
      fieldValue:
        this.props.content[this.props.settings.Name] && this.props.content[this.props.settings.Name].length > 0
          ? this.props.content[this.props.settings.Name]
          : this.props.settings.DefaultValue
          ? this.props.settings.DefaultValue
          : [],
      pickerIsOpen: false,
      selected:
        this.props.content[this.props.settings.Name] && this.props.content[this.props.settings.Name].length > 0
          ? this.props.content[this.props.settings.Name]
          : this.props.settings.DefaultValue
          ? this.props.settings.DefaultValue
          : [],
    }
    this.getSelected = this.getSelected.bind(this)
    if (this.props.actionName === 'edit') {
      this.getSelected()
    }
  }
  /**
   * getSelected
   * @return {GenericContent[]}
   */
  public async getSelected() {
    if (!this.props.repository) {
      throw new Error('You must pass a repository to this control')
    }
    //TODO: Check this. This is throwing an error now.
    const loadPath = this.props.content
      ? PathHelper.joinPaths(
          PathHelper.getContentUrl(this.props.content.Path),
          '/',
          this.props.settings.Name.toString(),
        )
      : ''
    const references = await this.props.repository.load<User>({
      idOrPath: loadPath,
      oDataOptions: {
        select: 'all',
      },
    })
    this.setState({
      fieldValue: references.d.Avatar && references.d.Avatar.Url,
    })
    return references
  }
  /**
   * Removes the item and clears the field value
   */
  public removeItem = () => {
    this.props.fieldOnChange && this.props.fieldOnChange(this.props.settings.Name, DEFAULT_AVATAR_PATH)
    this.setState({
      fieldValue: '',
    })
  }
  public handleDialogClose = () => {
    this.setState({
      pickerIsOpen: false,
    })
  }
  public handleCancelClick = () => {
    this.setState({
      selected: undefined,
    })
    this.handleDialogClose()
  }
  public handleOkClick = () => {
    const content = this.state.selected
    if (content && content.Path && this.state.fieldValue !== content.Path) {
      this.props.fieldOnChange && this.props.fieldOnChange(this.props.settings.Name, content.Path)

      this.setState({
        fieldValue: content.Path,
        selected: undefined,
      })
    }
    this.handleDialogClose()
  }
  public selectItem = (content: GenericContent) => {
    this.setState({
      selected: content,
    })
  }
  /**
   * Opens a picker to choose an item
   */
  public addItem = () => {
    this.setState({
      pickerIsOpen: true,
    })
  }
  public render() {
    switch (this.props.actionName) {
      case 'edit':
        return (
          <FormControl
            style={styles.root as any}
            key={this.props.settings.Name}
            component={'fieldset' as 'div'}
            required={this.props.settings.Compulsory}>
            <InputLabel shrink={true} htmlFor={this.props.settings.Name}>
              {this.props.settings.DisplayName}
            </InputLabel>
            <List
              dense={true}
              style={this.state.fieldValue.length > 0 ? styles.listContainer : { ...styles.listContainer, width: 150 }}>
              {
                <DefaultAvatarTemplate
                  repositoryUrl={this.props.repository!.configuration.repositoryUrl}
                  url={this.state.fieldValue}
                  add={this.addItem}
                  remove={this.removeItem}
                  actionName="edit"
                  renderIcon={this.props.renderIcon ? this.props.renderIcon : renderIconDefault}
                />
              }
            </List>
            {this.props.settings.Description ? (
              <FormHelperText>{this.props.settings.Description}</FormHelperText>
            ) : null}

            <Dialog onClose={this.handleDialogClose} open={this.state.pickerIsOpen}>
              <div style={styles.dialog}>
                <Typography variant="h5" gutterBottom={true}>
                  {AVATAR_PICKER_TITLE}
                </Typography>
                {/* REVIEW AVATAR PICKER PROPS*/}
                <AvatarPicker
                  path={
                    this.props.settings.SelectionRoots
                      ? this.props.settings.SelectionRoots[0]
                      : `/Root/Profiles/Public/${this.props.content.Name}/Document_Library`
                  }
                  allowedTypes={this.props.settings.AllowedTypes}
                  repository={this.props.repository!}
                  select={content => this.selectItem(content)}
                  repositoryUrl={this.props.repository!.configuration.repositoryUrl}
                  renderIcon={this.props.renderIcon ? this.props.renderIcon : renderIconDefault}
                />
                <DialogActions>
                  <Button onClick={this.handleCancelClick}>{CANCEL}</Button>
                  <Button variant="contained" onClick={this.handleOkClick} color="secondary">
                    {OK}
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </FormControl>
        )
      case 'new':
        return (
          <FormControl
            style={styles.root as any}
            key={this.props.settings.Name}
            component={'fieldset' as 'div'}
            required={this.props.settings.Compulsory}>
            <InputLabel shrink={true} htmlFor={this.props.settings.Name}>
              {this.props.settings.DisplayName}
            </InputLabel>
            <List
              dense={true}
              style={this.state.fieldValue.length > 0 ? styles.listContainer : { ...styles.listContainer, width: 200 }}>
              {
                <DefaultAvatarTemplate
                  repositoryUrl={this.props.repository!.configuration.repositoryUrl}
                  add={this.addItem}
                  actionName="new"
                  readOnly={this.props.settings.ReadOnly}
                  remove={this.removeItem}
                  renderIcon={this.props.renderIcon ? this.props.renderIcon : renderIconDefault}
                />
              }
            </List>
            {this.props.settings.Description ? (
              <FormHelperText>{this.props.settings.Description}</FormHelperText>
            ) : null}

            <Dialog onClose={this.handleDialogClose} open={this.state.pickerIsOpen}>
              <div style={styles.dialog}>
                <Typography variant="h5" gutterBottom={true}>
                  {AVATAR_PICKER_TITLE}
                </Typography>
                <AvatarPicker
                  // TODO: review this uploadFolderPath
                  path={
                    this.props.settings.SelectionRoots
                      ? this.props.settings.SelectionRoots[0]
                      : this.props['data-uploadFolderPath']
                  }
                  allowedTypes={this.props.settings.AllowedTypes}
                  repository={this.props.repository!}
                  select={content => this.selectItem(content)}
                  repositoryUrl={this.props.repository!.configuration.repositoryUrl}
                  renderIcon={this.props.renderIcon ? this.props.renderIcon : renderIconDefault}
                />
                <DialogActions>
                  <Button onClick={this.handleCancelClick}>{CANCEL}</Button>
                  <Button variant="contained" onClick={this.handleOkClick} color="secondary">
                    {OK}
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </FormControl>
        )
      case 'browse':
      default:
        return this.props.content[this.props.settings.Name] ? (
          <FormControl style={styles.root as any}>
            <InputLabel shrink={true} htmlFor={this.props.settings.Name}>
              {this.props.settings.DisplayName}
            </InputLabel>
            <List
              dense={true}
              style={
                this.props.content[this.props.settings.Name].Url
                  ? styles.listContainer
                  : { ...styles.listContainer, width: 200 }
              }>
              <DefaultAvatarTemplate
                repositoryUrl={this.props.repository!.configuration.repositoryUrl}
                url={this.props.content[this.props.settings.Name].Url}
                add={this.addItem}
                actionName="browse"
                renderIcon={this.props.renderIcon ? this.props.renderIcon : renderIconDefault}
              />
            </List>
          </FormControl>
        ) : null
    }
  }
}
