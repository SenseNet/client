import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import { Close, Menu } from '@material-ui/icons'
import React, { useContext, useState } from 'react'
import { withRouter } from 'react-router'
import { matchPath, NavLink, RouteComponentProps } from 'react-router-dom'
import { useRepository } from '@sensenet/hooks-react'
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core'
import clsx from 'clsx'
import { useDrawerItems, useLocalization, usePersonalSettings } from '../../hooks'
import { ResponsivePersonalSetttings } from '../../context'
import { AddButton } from '../AddButton'
import { SearchButton } from '../search-button'
import { globals } from '../../globalStyles'

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    paper: {
      flexGrow: 0,
      flexShrink: 0,
      position: 'relative',
      width: globals.common.drawerWidthCollapsed,
      '&$opened': {
        width: globals.common.drawerWidthExpanded,
      },
    },
    opened: {},
    backgroundDiv: {
      height: '100%',
      backgroundColor: theme.palette.type === 'light' ? globals.light.drawerBackground : globals.dark.drawerBackground,
      border: theme.palette.type === 'light' ? clsx(globals.light.navMenuBorderColor, '1px') : 'none',
    },
    list: {
      width: '100%',
      height: '100%',
      flexGrow: 1,
      flexShrink: 0,
      display: 'flex',
      overflow: 'hidden',
      justifyContent: 'space-between',
      flexDirection: 'column',
      transition: 'width 100ms ease-in-out',
      paddingTop: 0,
    },
    listWrapper: {
      overflowY: 'auto',
      overflowX: 'hidden',
      width: '100%',
    },
    navLink: {
      textDecoration: 'none',
      opacity: 0.54,
    },
    listButton: {
      height: '65px',
    },
    navLinkActive: {
      opacity: 1,
      '& .MuiListItem-root': { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
      '& svg': {
        fill: theme.palette.common.white,
      },
    },
    listItemIconDark: {
      color: theme.palette.common.white,
    },
    listItemIconLight: {
      color: theme.palette.common.black,
      opacity: 0.87,
    },
    expandCollapseWrapper: {
      height: '49px',
      padding: '0 0 12px 0',
      borderBottom: 'transparent 1px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '13px',
    },
    centered: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
})

const PermanentDrawer: React.FunctionComponent<RouteComponentProps> = props => {
  const personalSettings = usePersonalSettings()
  const classes = useStyles()
  const settings = useContext(ResponsivePersonalSetttings)
  const theme = useTheme()

  const repo = useRepository()
  const [currentPath, setCurrentPath] = useState('')
  const [opened, setOpened] = useState(settings.drawer.type === 'permanent')
  const items = useDrawerItems()
  const localization = useLocalization().drawer

  if (!settings.drawer.enabled) {
    return null
  }

  return (
    <Paper className={clsx(classes.paper, { [classes.opened]: opened })}>
      <div className={classes.backgroundDiv}>
        <List className={classes.list}>
          <div className={classes.listWrapper}>
            {settings.drawer.type === 'mini-variant' ? (
              <ListItem
                className={clsx(classes.listButton)}
                button={true}
                onClick={() => setOpened(!opened)}
                key="expandcollapse">
                <ListItemIcon className={classes.centered}>
                  <Tooltip
                    className={classes.centered}
                    title={opened ? localization.collapse : localization.expand}
                    placement="right">
                    <div>{opened ? <Close /> : <Menu />}</div>
                  </Tooltip>
                </ListItemIcon>
              </ListItem>
            ) : null}

            {matchPath(props.location.pathname, `/:repositoryId/saved-queries`) === null ? (
              <AddButton isOpened={opened} path={currentPath} />
            ) : (
              <SearchButton isOpened={opened} />
            )}

            {items.map((item, index) => {
              return (
                <NavLink
                  to={`/${btoa(repo.configuration.repositoryUrl)}${item.url}`}
                  className={classes.navLink}
                  key={index}
                  onClick={() => setCurrentPath(item.root ? item.root : '')}
                  activeClassName={classes.navLinkActive}>
                  <ListItem
                    className={classes.listButton}
                    button={true}
                    key={index}
                    selected={matchPath(props.location.pathname, `/:repositoryId${item.url}`) === null ? false : true}>
                    <ListItemIcon
                      className={clsx(classes.listItemIconDark, classes.centered, {
                        [classes.listItemIconLight]: personalSettings.theme === 'light',
                      })}>
                      <Tooltip title={item.secondaryText} placement="right">
                        {item.icon}
                      </Tooltip>
                    </ListItemIcon>
                    {opened ? (
                      <ListItemText
                        primary={item.primaryText}
                        style={{
                          color:
                            theme.palette.type === 'light' ? theme.palette.common.black : theme.palette.common.white,
                        }}
                      />
                    ) : null}
                  </ListItem>
                </NavLink>
              )
            })}
          </div>
        </List>
      </div>
    </Paper>
  )
}

const connectedComponent = withRouter(PermanentDrawer)
export { connectedComponent as PermanentDrawer }
