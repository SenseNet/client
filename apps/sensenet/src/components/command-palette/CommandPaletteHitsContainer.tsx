import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import React, { useContext } from 'react'
import { RenderSuggestionsContainerParams } from 'react-autosuggest'
import { ResponsiveContext } from '../ResponsiveContextProvider'

export const CommandPaletteHitsContainer: React.FunctionComponent<
  RenderSuggestionsContainerParams & { width: number }
> = options => {
  const device = useContext(ResponsiveContext)
  return (
    <Paper
      square={true}
      style={{
        position: 'fixed',
        zIndex: 1,
        width: options.width,
      }}>
      <List
        dense={device === 'desktop' ? false : true}
        component="nav"
        {...options.containerProps}
        style={{ padding: 0 }}>
        {options.children}
      </List>
    </Paper>
  )
}
