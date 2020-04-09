import { AppBar, createStyles, IconButton, makeStyles, Toolbar } from '@material-ui/core'
import Menu from '@material-ui/icons/Menu'
import clsx from 'clsx'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ResponsivePersonalSetttings } from '../../context'
import { globals, useGlobalStyles } from '../../globalStyles'
import { useCommandPalette } from '../../hooks'
import logo from '../../assets/sensenet-icon-32.png'
import { CommandPalette } from '../command-palette/CommandPalette'
import { DesktopNavMenu } from './desktop-nav-menu'

const useStyles = makeStyles(() => {
  return createStyles({
    appBar: {
      position: 'relative',
      height: globals.common.headerHeight,
      backgroundColor: globals.common.headerBackground,
      boxShadow: 'none',
    },
    toolBar: {
      position: 'static',
      height: '100%',
      paddingLeft: '32px',
      paddingRight: 0,
    },
    logo: {
      marginRight: '39px',
      filter: 'drop-shadow(0px 0px 3px black)',
    },
    repositorySelectorWrapper: {
      flexDirection: 'row',
      textDecoration: 'none',
      overflow: 'hidden',
      flexGrow: 1,
    },
    flexGrow0: {
      flexGrow: 0,
    },
    commandPaletteReplacement: {
      flex: 1,
      marginRight: '10px',
    },
  })
})

export const DesktopAppBar: React.FunctionComponent<{ openDrawer?: () => void }> = (props) => {
  const personalSettings = useContext(ResponsivePersonalSetttings)
  const commandPalette = useCommandPalette()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <AppBar position="sticky" className={clsx(globalClasses.centeredHorizontal, classes.appBar)}>
      <Toolbar className={classes.toolBar}>
        <div
          className={clsx(globalClasses.centeredVertical, classes.repositorySelectorWrapper, {
            [classes.flexGrow0]: commandPalette.isOpened,
          })}>
          <Link to="/" className={globalClasses.centeredVertical}>
            <img src={logo} className={classes.logo} alt="logo" />
          </Link>
          {personalSettings.drawer.type === 'temporary' ? (
            <IconButton
              onClick={() => {
                props.openDrawer && props.openDrawer()
              }}>
              <Menu />
            </IconButton>
          ) : null}
        </div>

        {personalSettings.commandPalette.enabled ? (
          <CommandPalette {...commandPalette} />
        ) : (
          <div className={classes.commandPaletteReplacement} />
        )}
        <DesktopNavMenu />
      </Toolbar>
    </AppBar>
  )
}
