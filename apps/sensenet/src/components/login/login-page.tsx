import { Button, Container, createStyles, Grid, makeStyles, TextField, Theme, Typography } from '@material-ui/core'
import { useInjector } from '@sensenet/hooks-react'
import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import snLogo from '../../assets/sensenet-icon-32.png'
import { useLocalization } from '../../hooks'
import { PersonalSettings } from '../../services'
import { applicationPaths } from '../../services/auth-service'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topbar: {
      padding: theme.spacing(1),
    },
  }),
)

export function LoginPage() {
  const classes = useStyles()
  const injector = useInjector()
  const personalSettings = injector.getInstance(PersonalSettings).userValue.getValue()
  const settingsManager = injector.getInstance(PersonalSettings)
  const localization = useLocalization().login
  const history = useHistory()
  const [url, setUrl] = useState('')

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    personalSettings.lastRepository = url
    settingsManager.setPersonalSettingsValue({ ...personalSettings })
    history.push(applicationPaths.login)
  }

  return (
    <div>
      <Grid container={true} direction="row">
        <Container maxWidth="lg" className={classes.topbar}>
          <Link to="/">
            <img src={snLogo} alt="sensenet logo" />
          </Link>
        </Container>
      </Grid>
      <Container maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <TextField
            id="repository"
            margin="dense"
            required={true}
            name="repository"
            label={localization.repositoryLabel}
            placeholder={localization.repositoryHelperText}
            fullWidth={true}
            type="url"
            value={url}
            onChange={ev => {
              setUrl(ev.target.value)
            }}
          />
          <Button
            aria-label={localization.loginButtonTitle}
            fullWidth={true}
            variant="contained"
            color="primary"
            type="submit">
            <Typography variant="button">{localization.loginButtonTitle}</Typography>
          </Button>
        </form>
      </Container>
    </div>
  )
}
