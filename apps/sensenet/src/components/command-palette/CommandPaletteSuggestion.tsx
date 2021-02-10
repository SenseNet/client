import { darken, Paper, useTheme } from '@material-ui/core'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import React, { useContext } from 'react'
import { RenderSuggestionParams } from 'react-autosuggest'
import { ResponsiveContext } from '../../context'
import { globals } from '../../globalStyles'
import { Icon } from '../Icon'
import { CommandPaletteItem } from './CommandPalette'

export const getMatchParts = (hits: string[], term: string) => {
  const matchValueArr = match(term, hits.join(' '))

  const parseValue = parse(term, matchValueArr as Array<[number, number]>)

  return parseValue.map((part, index) =>
    part.highlight ? <strong key={String(index)}>{part.text}</strong> : <span key={String(index)}>{part.text}</span>,
  )
}

export const CommandPaletteSuggestion: React.FunctionComponent<{
  suggestion: CommandPaletteItem
  params: RenderSuggestionParams
}> = ({ suggestion, params }) => {
  const device = useContext(ResponsiveContext)
  const theme = useTheme()
  return (
    <Paper>
      <ListItem
        button={true}
        selected={params.isHighlighted}
        data-test="search-suggestion-item"
        style={{
          backgroundColor:
            theme.palette.type === 'light'
              ? darken(globals.light.navMenuColor, params.isHighlighted ? 0.1 : 0)
              : darken(globals.dark.navMenuColor, params.isHighlighted ? 0.25 : 0),
        }}>
        {suggestion.content ? (
          <ListItemIcon style={device === 'mobile' ? { margin: '0 3px' } : { margin: '0 8px' }}>
            <Icon
              item={suggestion.content}
              style={device === 'mobile' ? { width: '25px', height: '25px' } : { width: '40px', height: '40px' }}
            />
          </ListItemIcon>
        ) : null}
        <ListItemText
          primary={getMatchParts(suggestion.hits, suggestion.primaryText)}
          secondary={suggestion.secondaryText && getMatchParts(suggestion.hits, suggestion.secondaryText)}
          secondaryTypographyProps={{
            style: {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
          }}
        />
      </ListItem>
    </Paper>
  )
}
