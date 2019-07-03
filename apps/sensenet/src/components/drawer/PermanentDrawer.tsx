import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import Settings from '@material-ui/icons/Settings'
import { PathHelper } from '@sensenet/client-utils'
import React, { useContext, useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import { Link, matchPath, NavLink, RouteComponentProps } from 'react-router-dom'
import { ResponsivePersonalSetttings } from '../../context'
import { useLocalization, usePersonalSettings, useRepository, useSession, useTheme } from '../../hooks'
import { LogoutButton } from '../LogoutButton'
import { UserAvatar } from '../UserAvatar'
import { getAllowedDrawerItems } from './Items'

const PermanentDrawer: React.FunctionComponent<RouteComponentProps> = props => {
  const settings = useContext(ResponsivePersonalSetttings)
  const personalSettings = usePersonalSettings()
  const theme = useTheme()
  const session = useSession()
  const repo = useRepository()

  const [opened, setOpened] = useState(settings.drawer.type === 'permanent')
  const [items, setItems] = useState(getAllowedDrawerItems(session.groups))
  const localization = useLocalization().drawer

  const [currentRepoEntry, setCurrentRepoEntry] = useState(
    personalSettings.repositories.find(r => r.url === PathHelper.trimSlashes(repo.configuration.repositoryUrl)),
  )

  useEffect(
    () =>
      setCurrentRepoEntry(
        personalSettings.repositories.find(r => r.url === PathHelper.trimSlashes(repo.configuration.repositoryUrl)),
      ),
    [personalSettings, repo],
  )

  useEffect(() => setItems(getAllowedDrawerItems(session.groups)), [session.groups])

  if (!settings.drawer.enabled) {
    return null
  }

  return (
    <Paper style={{ flexGrow: 0, flexShrink: 0 }}>
      <List
        dense={true}
        style={{
          width: opened ? 330 : 55,
          height: '100%',
          flexGrow: 1,
          flexShrink: 0,
          display: 'flex',
          overflow: 'hidden',
          justifyContent: 'space-between',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default, // '#222',
          paddingTop: '1em',
          transition: 'width 100ms ease-in-out',
        }}>
        <div style={{ paddingTop: '1em' }}>
          {items
            .filter(i => settings.drawer.items && settings.drawer.items.indexOf(i.name) !== -1)
            .map(item => {
              const isActive = matchPath(props.location.pathname, `/:repositoryId${item.url}`)
              return isActive ? (
                <ListItem button={true} key={item.name} selected>
                  <Tooltip
                    title={
                      <React.Fragment>
                        {localization[item.primaryText]} <br /> {localization[item.secondaryText]}
                      </React.Fragment>
                    }
                    placement="right">
                    <ListItemIcon>{item.icon}</ListItemIcon>
                  </Tooltip>
                  {opened ? (
                    <ListItemText
                      primary={localization[item.primaryText]}
                      secondary={localization[item.secondaryText]}
                    />
                  ) : null}
                </ListItem>
              ) : (
                <NavLink
                  to={`/${btoa(repo.configuration.repositoryUrl)}${item.url}`}
                  activeStyle={{ opacity: 1 }}
                  style={{ textDecoration: 'none', opacity: 0.54 }}
                  key={item.name}>
                  <ListItem button={true}>
                    <Tooltip
                      title={
                        <React.Fragment>
                          {localization[item.primaryText]} <br /> {localization[item.secondaryText]}
                        </React.Fragment>
                      }
                      placement="right">
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    </Tooltip>
                    {opened ? (
                      <ListItemText
                        primary={localization[item.primaryText]}
                        secondary={localization[item.secondaryText]}
                      />
                    ) : null}
                  </ListItem>
                </NavLink>
              )
            })}
        </div>
        <div>
          {opened ? (
            <Paper style={{ padding: '1em' }}>
              <ListItem>
                <ListItemIcon>
                  <UserAvatar user={session.currentUser} repositoryUrl={repo.configuration.repositoryUrl} />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    style: { overflow: 'hidden', textOverflow: 'ellipsis' },
                    title: session.currentUser.DisplayName || session.currentUser.Name,
                  }}
                  secondaryTypographyProps={{
                    style: { overflow: 'hidden', textOverflow: 'ellipsis' },
                    title: (currentRepoEntry && currentRepoEntry.displayName) || repo.configuration.repositoryUrl,
                  }}
                  primary={session.currentUser.DisplayName || session.currentUser.Name}
                  secondary={(currentRepoEntry && currentRepoEntry.displayName) || repo.configuration.repositoryUrl}
                />
                <ListItemSecondaryAction>
                  <Link to={`/personalSettings`} style={{ textDecoration: 'none' }}>
                    <IconButton title={localization.personalSettingsTitle}>
                      <Settings />
                    </IconButton>
                  </Link>
                  <LogoutButton />
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ) : (
            <>
              <NavLink
                to={'/personalSettings'}
                activeStyle={{ opacity: 1 }}
                style={{ textDecoration: 'none', opacity: 0.54 }}
                key={'personalSettings'}>
                <ListItem button={true}>
                  <Tooltip
                    title={
                      <React.Fragment>
                        {localization.personalSettingsTitle} <br /> {localization.personalSettingsSecondaryText}
                      </React.Fragment>
                    }
                    placement="right">
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                  </Tooltip>
                </ListItem>
              </NavLink>
              <LogoutButton buttonStyle={{ width: '100%' }} />
            </>
          )}

          {settings.drawer.type === 'mini-variant' ? (
            <ListItem button={true} onClick={() => setOpened(!opened)} key="expandcollapse">
              <Tooltip title={opened ? localization.collapse : localization.expand} placement="right">
                <ListItemIcon>{opened ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}</ListItemIcon>
              </Tooltip>
              {opened ? <ListItemText primary={localization.collapse} /> : null}
            </ListItem>
          ) : null}
        </div>
      </List>
    </Paper>
  )
}

const connectedComponent = withRouter(PermanentDrawer)
export { connectedComponent as PermanentDrawer }
