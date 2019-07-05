import CircularProgress from '@material-ui/core/CircularProgress'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { ConstantContent, ODataCollectionResponse } from '@sensenet/client-core'
import { ContentType, GenericContent } from '@sensenet/default-content-types'
import React, { Component } from 'react'
import { typeicons } from '../assets/icons'
import { renderIconDefault } from './icon'
import { ReactClientFieldSetting } from './ClientFieldSetting'

const INPUT_PLACEHOLDER = 'Start typing to add another type'
const ITEM_HEIGHT = 48

const styles = {
  inputContainer: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'none',
    position: 'relative',
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  button: {
    padding: 10,
  },
  listContainer: {
    position: 'absolute',
    top: '40px',
    maxHeight: ITEM_HEIGHT * 2.5,
    overflow: 'auto',
    zIndex: 10,
  },
  ddIsOpened: {
    display: 'block',
  },
  ddIsClosed: {
    display: 'none',
  },
}

const compare = (a: GenericContent, b: GenericContent) => {
  if (a.Name < b.Name) {
    return -1
  }
  if (a.Name > b.Name) {
    return 1
  }
  return 0
}

/**
 * Interface for AllowedChildTypes state
 */
export interface AllowedChildTypesState {
  value: string[]
  effectiveAllowedChildTypes: ContentType[]
  allowedTypesOnCTD: ContentType[]
  items: ContentType[]
  removeable: boolean
  allCTDs: ContentType[]
  isLoading: boolean
  inputValue: string
  isOpened: boolean
  anchorEl: HTMLElement
  getMenuItem: (item: ContentType, select: (item: ContentType) => void) => JSX.Element
  filteredList: ContentType[]
  selected: ContentType | null
}
/**
 * Field control that represents an AllowedChildTypes field. Available values will be populated from the FieldSettings.
 */
export class AllowedChildTypes extends Component<ReactClientFieldSetting, AllowedChildTypesState> {
  constructor(props: AllowedChildTypes['props']) {
    super(props)
    this.state = {
      value: [],
      effectiveAllowedChildTypes: [],
      allowedTypesOnCTD: [],
      items: [],
      removeable: true,
      allCTDs: [],
      isLoading: false,
      inputValue: '',
      isOpened: false,
      anchorEl: null as any,
      getMenuItem: (item: ContentType, select: (item: ContentType) => void) => (
        <ListItem key={item.Id} value={item.Id} onClick={() => select(item)} style={{ margin: 0 }}>
          <ListItemIcon style={{ margin: 0 }}>
            {this.props.renderIcon
              ? this.props.renderIcon(item.Icon ? item.Icon.toLowerCase() : 'contenttype')
              : renderIconDefault(
                  item.Icon && typeicons[item.Icon.toLowerCase()]
                    ? typeicons[item.Icon.toLowerCase()]
                    : typeicons.contenttype,
                )}
          </ListItemIcon>
          <ListItemText primary={item.DisplayName} />
        </ListItem>
      ),
      filteredList: [],
      selected: null,
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.handleClickAway = this.handleClickAway.bind(this)
    this.getAllowedChildTypes()
    this.getAllContentTypes()
  }

  /**
   * component will unmount
   */
  public componentWillUnmount() {
    this.willUnmount = true
  }

  private willUnmount: boolean = false

  private async getAllowedChildTypes() {
    if (!this.props.repository) {
      throw new Error('You must pass a repository to this control')
    }
    if (!this.props.content) {
      return
    }

    const result = await this.props.repository.load<GenericContent>({
      idOrPath: this.props.content.Id,
      oDataOptions: {
        select: 'EffectiveAllowedChildTypes',
        expand: 'EffectiveAllowedChildTypes',
      },
    })
    if (this.willUnmount) {
      return
    }

    const allowedChildTypesFromCTD = (await this.props.repository.executeAction({
      idOrPath: this.props.content.Id,
      name: 'GetAllowedChildTypesFromCTD',
      method: 'GET',
      body: {
        select: ['Name', 'DisplayName', 'Icon'],
      },
    })) as ODataCollectionResponse<ContentType>

    const typeResults = result.d.EffectiveAllowedChildTypes as ContentType[]

    const types = this.getTypes(typeResults, allowedChildTypesFromCTD)

    this.setState({
      effectiveAllowedChildTypes: typeResults,
      items: types,
      removeable: typeResults.length === 0 || this.props.actionName !== 'new',
      value: types.map((t: ContentType) => t.Name),
    })
  }

  private getTypes(typeResults: ContentType[], allowedChildTypesFromCTD: ODataCollectionResponse<ContentType>) {
    if (this.props.actionName === 'new') {
      return (allowedChildTypesFromCTD.d.results.length && allowedChildTypesFromCTD.d.results) || []
    }
    return typeResults.length ? typeResults : allowedChildTypesFromCTD.d.results
  }

  private async getAllContentTypes() {
    if (!this.props.repository) {
      throw new Error('You must pass a repository to this control')
    }

    const result = (await this.props.repository.executeAction({
      idOrPath: ConstantContent.PORTAL_ROOT.Id,
      name: 'GetAllContentTypes',
      method: 'GET',
      oDataOptions: {
        select: ['Name', 'DisplayName', 'Icon'],
      },
    })) as ODataCollectionResponse<ContentType>
    if (this.willUnmount) {
      return
    }
    this.setState({
      allCTDs: result.d.results.sort(compare),
      filteredList: result.d.results.sort(compare),
    })
  }

  public handleRemove = (item: GenericContent) => {
    const { items } = this.state
    const index = items.findIndex(i => item.Name === i.Name)
    if (items.length > 1) {
      this.setState({
        items: [...items.slice(0, index), ...items.slice(index + 1)],
      })
    } else {
      this.setState({
        items: this.state.allowedTypesOnCTD,
        removeable: false,
      })
    }
  }

  public handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const term = e.target.value
    this.setState({
      filteredList: this.state.allCTDs.filter(ctd => {
        return ctd.DisplayName && ctd.DisplayName.toLowerCase().includes(term.toLowerCase())
      }),
      inputValue: term,
    })
    if (term.length === 0) {
      this.setState({
        selected: null,
      })
    }
  }

  private handleClickAway() {
    this.setState({ isOpened: false })
  }

  public handleSelect(item: ContentType) {
    this.setState({
      inputValue: item.DisplayName || '',
      isOpened: false,
      isLoading: false,
      selected: item,
    })
  }

  public handleOnClick = () => {
    this.setState({
      isOpened: true,
    })
  }

  public handleAddClick = () => {
    const { items, selected, value } = this.state
    const newValue = selected ? [...value, selected.Name] : value
    if (this.state.removeable) {
      this.setState({
        items: selected ? [...items, selected] : items,
        value: newValue,
        selected: null,
        inputValue: '',
        filteredList: this.state.allCTDs,
      })
    } else {
      this.setState({
        items: selected ? [selected] : [],
        value: selected ? [selected.Name] : [],
        selected: null,
        inputValue: '',
        filteredList: this.state.allCTDs,
        removeable: true,
      })
    }
    this.props.fieldOnChange && this.props.fieldOnChange(this.props.settings.Name, newValue as any)
  }

  public render() {
    switch (this.props.actionName) {
      case 'edit':
      case 'new':
        return (
          <ClickAwayListener onClickAway={this.handleClickAway}>
            <FormControl>
              <FormLabel component={'legend' as 'label'}>{this.props.settings.DisplayName}</FormLabel>
              <List dense={true}>
                {this.state.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon style={{ margin: 0 }}>
                      {this.props.renderIcon
                        ? this.props.renderIcon(item.Icon ? item.Icon.toLowerCase() : 'contenttype')
                        : renderIconDefault(
                            item.Icon && typeicons[item.Icon.toLowerCase()]
                              ? typeicons[item.Icon.toLowerCase()]
                              : typeicons.contenttype,
                          )}
                    </ListItemIcon>
                    <ListItemText primary={item.DisplayName} />
                    {this.state.removeable ? (
                      <ListItemSecondaryAction>
                        <IconButton aria-label="Remove" onClick={() => this.handleRemove(item)}>
                          {this.props.renderIcon ? this.props.renderIcon('delete') : renderIconDefault('delete')}
                        </IconButton>
                      </ListItemSecondaryAction>
                    ) : null}
                  </ListItem>
                ))}
              </List>
              <div
                ref={(ref: HTMLDivElement) => ref && this.state.anchorEl !== ref && this.setState({ anchorEl: ref })}
                style={{ position: 'relative' }}>
                <div style={styles.inputContainer as any}>
                  <TextField
                    type="text"
                    onClick={this.handleOnClick}
                    onChange={this.handleInputChange}
                    placeholder={INPUT_PLACEHOLDER}
                    InputProps={{
                      endAdornment: this.state.isLoading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : null,
                    }}
                    fullWidth={true}
                    value={this.state.inputValue}
                    style={styles.input}
                  />
                  <IconButton
                    style={styles.button}
                    disabled={this.state.selected && this.state.selected.Name.length > 0 ? false : true}
                    onClick={this.handleAddClick}>
                    {this.props.renderIcon ? this.props.renderIcon('add') : renderIconDefault('add')}
                  </IconButton>
                </div>
                <Paper
                  style={
                    this.state.isOpened
                      ? { ...styles.ddIsOpened, ...(styles.listContainer as any) }
                      : { ...styles.ddIsClosed, ...(styles.listContainer as any) }
                  }>
                  <List>
                    {this.state.filteredList.length > 0 ? (
                      this.state.filteredList.map((item: any) => this.state.getMenuItem(item, this.handleSelect))
                    ) : (
                      <ListItem>No hits</ListItem>
                    )}
                  </List>
                </Paper>
                <FormHelperText>{this.props.settings.Description}</FormHelperText>
              </div>
            </FormControl>
          </ClickAwayListener>
        )
      case 'browse':
      default:
        return (
          <FormControl>
            <FormLabel component={'legend' as 'label'}>{this.props.settings.DisplayName}</FormLabel>
            <List dense={true}>
              {this.state.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon style={{ margin: 0 }}>
                    {this.props.renderIcon
                      ? this.props.renderIcon(item.Icon ? item.Icon.toLowerCase() : 'contenttype')
                      : renderIconDefault(
                          item.Icon && typeicons[item.Icon.toLowerCase()]
                            ? typeicons[item.Icon.toLowerCase()]
                            : typeicons.contenttype,
                        )}
                  </ListItemIcon>
                  <ListItemText primary={item.DisplayName} />
                </ListItem>
              ))}
            </List>
          </FormControl>
        )
    }
  }
}
