import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    title: {
      flexGrow: 1,
    },
  }),
)
/**
 * Navbar component
 */
export const NavBarComponent: React.FunctionComponent = () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Document Browser
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}
