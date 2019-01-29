import { ListItemText } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import TextField, { TextFieldProps as MaterialTextFieldProps } from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { debounce } from '@sensenet/client-utils'
import { GenericContent, ReferenceFieldSetting } from '@sensenet/default-content-types'
import { Query, QueryExpression, QueryOperators } from '@sensenet/query'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import React from 'react'
import Autosuggest, {
  GetSuggestionValue,
  InputProps,
  OnSuggestionSelected,
  RenderInputComponent,
  RenderSuggestion,
} from 'react-autosuggest'

/**
 * Props for the ReferenceField component
 */
export interface ReferenceFieldProps<T> {
  fieldName: keyof T
  fieldKey?: string
  fieldSetting: ReferenceFieldSetting
  defaultValueIdOrPath?: string | number
  fetchItems: (fetchQuery: Query<T>) => Promise<T[]>
  onQueryChange: (key: string, query: Query<T>) => void
  renderSuggestion?: RenderSuggestion<T>
}

/**
 * State object for the ReferenceField component
 */
export interface ReferenceFieldState<T extends GenericContent> {
  inputValue: string
  isLoading: boolean
  isOpened: boolean
  term?: string
  items: T[]
  selected: T | null
  anchorEl: HTMLElement
  renderSuggestion: RenderSuggestion<T>
}

/**
 * Reference field picker component
 */
export class ReferenceField<T extends GenericContent = GenericContent> extends React.Component<
  ReferenceFieldProps<T> & MaterialTextFieldProps,
  ReferenceFieldState<T>
> {
  /**
   *
   */
  constructor(props: ReferenceField<T>['props']) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.fetchItems = debounce(this.fetchItems.bind(this), 500)
    this.onChange = this.onChange.bind(this)
  }

  /**
   * Initial state
   */
  public state: ReferenceFieldState<T> = {
    inputValue: '',
    isOpened: false,
    isLoading: false,
    items: [],
    selected: null,
    anchorEl: null as any,
    renderSuggestion: (item, { query, isHighlighted }) => {
      const matchesName = match(item.DisplayName || item.Name, query)
      const partsName = parse(item.DisplayName || item.Name, matchesName)

      const primary = partsName.map((part, index) =>
        part.highlight ? (
          <span key={String(index)} style={{ fontWeight: 500 }}>
            {part.text}
          </span>
        ) : (
          <strong key={String(index)} style={{ fontWeight: 300 }}>
            {part.text}
          </strong>
        ),
      )

      const matchesPath = match(item.Path, query)
      const partsPath = parse(item.Path, matchesPath)

      const secondary = partsPath.map((part, index) =>
        part.highlight ? (
          <span key={String(index)} style={{ fontWeight: 500 }}>
            {part.text}
          </span>
        ) : (
          <strong key={String(index)} style={{ fontWeight: 300 }}>
            {part.text}
          </strong>
        ),
      )

      return (
        <ListItem key={item.Id} selected={isHighlighted} component="div" value={item.Id}>
          <ListItemText primary={primary} secondary={secondary} />
          <Typography variant="body2">{}</Typography>
        </ListItem>
      )
    },
  }

  public onChange = (inputValue: string) => {
    this.setState({ inputValue })
    this.fetchItems(this.getQueryFromTerm(`*${inputValue}*`))
  }

  public async fetchItems(query: Query<T>) {
    const items = await this.props.fetchItems(query)
    this.setState({ items })
  }

  public renderInputComponent: RenderInputComponent<T> = (inputProps: InputProps<T>) => {
    const {
      classes,
      inputRef = () => {
        /** */
      },
      ref,
      defaultValue,
      onChange,
      displayName,
      name,
      ...other
    } = inputProps

    return (
      <TextField
        type="text"
        label={this.props.fieldSetting && this.props.fieldSetting.DisplayName}
        placeholder={this.props.fieldSetting && this.props.fieldSetting.DisplayName}
        title={this.props.fieldSetting && this.props.fieldSetting.Description}
        InputProps={{
          inputRef: node => {
            ref(node)
            inputRef(node)
          },
          endAdornment: this.state.isLoading ? (
            <InputAdornment position="end">
              <CircularProgress size={16} />
            </InputAdornment>
          ) : null,
        }}
        value={this.state.inputValue}
        onChange={ev => this.onChange(ev.target.value)}
        {...other}
      />
    )
  }
  public getSuggestionValue: GetSuggestionValue<T> = c => {
    return c.DisplayName || c.Name
  }
  public onSuggestionSelected: OnSuggestionSelected<T> = (_ev, data) => {
    _ev.preventDefault()
    this.handleSelect(data.suggestion)
  }

  public async componentDidMount() {
    /** */
    if (this.props.defaultValueIdOrPath) {
      const items = await this.props.fetchItems(
        new Query(q =>
          isNaN(this.props.defaultValueIdOrPath as number)
            ? q.equals('Path', this.props.defaultValueIdOrPath)
            : q.equals('Id', this.props.defaultValueIdOrPath),
        ),
      )
      if (items.length === 1 && items[0]) {
        const item = items[0]
        this.setState({
          inputValue: item.DisplayName || item.Name,
          selected: item,
        })
        this.props.onQueryChange(
          this.props.fieldKey || this.props.fieldName.toString(),
          new Query(q => q.equals(this.props.fieldName, item.Id)),
        )
      }
    }
  }

  public getQueryFromTerm<TQueryReturns>(term: string) {
    // tslint:disable
    const query = new Query<TQueryReturns>(q =>
      q.query(q2 =>
        q2
          .equals('Name', term)
          .or.equals('DisplayName', term)
          .or.equals('Path', term),
      ),
    )

    if (this.props.fieldSetting.AllowedTypes) {
      new QueryOperators(query).and.query(q2 => {
        ;(this.props.fieldSetting.AllowedTypes as string[]).map((allowedType, index, array) => {
          new QueryExpression(q2['queryRef']).term(`TypeIs:${allowedType}`)
          if (index < array.length - 1) {
            new QueryOperators(q2['queryRef']).or
          }
        })
        return q2
      })
    }

    if (this.props.fieldSetting.SelectionRoots && this.props.fieldSetting.SelectionRoots.length) {
      new QueryOperators(query).and.query(q2 => {
        ;(this.props.fieldSetting.SelectionRoots as string[]).forEach((root, index, array) => {
          new QueryExpression(q2['queryRef']).inTree(root)
          if (index < array.length - 1) {
            new QueryOperators(q2['queryRef']).or
          }
        })
        return q2
      })
    }
    return query
    // tslint:enable
  }

  private handleSelect(item: T) {
    this.setState({
      inputValue: item.DisplayName || item.Name,
      selected: item,
      isOpened: false,
    })
    this.props.onQueryChange(
      this.props.fieldKey || this.props.fieldName.toString(),
      new Query(q => q.equals(this.props.fieldName, item.Id)),
    )
  }

  /**
   * Renders the component
   */
  public render() {
    const displayName = (this.props.fieldSetting && this.props.fieldSetting.DisplayName) || this.props.label
    const description = (this.props.fieldSetting && this.props.fieldSetting.Description) || ''
    const inputProps: InputProps<T> = {
      value: this.state.inputValue,
      onChange: ev => this.onChange((ev.target as HTMLInputElement).value),
      id: 'CommandBoxInput',
      displayName,
      description,
    }

    return (
      <div ref={ref => ref && this.state.anchorEl !== ref && this.setState({ anchorEl: ref })}>
        <Autosuggest
          theme={{
            suggestionsList: {
              listStyle: 'none',
              margin: 0,
              padding: 0,
            },
          }}
          suggestions={this.state.items}
          onSuggestionsFetchRequested={async req => {
            const query = this.getQueryFromTerm<T>(`*${req.value}*`)
            const items = await this.props.fetchItems(query)
            this.setState({ items })
          }}
          onSuggestionsClearRequested={() => {
            this.setState({ items: [] })
          }}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.state.renderSuggestion}
          inputProps={inputProps}
          renderInputComponent={this.renderInputComponent}
          renderSuggestionsContainer={options => (
            <Paper
              square={true}
              style={{
                position: 'fixed',
                zIndex: 1,
              }}>
              <List component="nav" {...options.containerProps} style={{ padding: 0 }}>
                {options.children}
              </List>
            </Paper>
          )}
          onSuggestionSelected={this.onSuggestionSelected}
        />
      </div>
    )
  }
}
