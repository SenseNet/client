import { Button, Container, createStyles, Grid, makeStyles, TextField, Theme, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthentication, useLogger } from '@sensenet/hooks-react'
import snLogo from '../../assets/sensenet-icon-32.png'
import { useLocalization, useRepoUrlFromLocalStorage } from '../../hooks'
import { getAuthService } from '../../services/auth-service'
import { FullScreenLoader } from '../FullScreenLoader'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topbar: {
      padding: theme.spacing(1),
    },
  }),
)

export default function LoginPage() {
  const classes = useStyles()
  const localization = useLocalization().login
  const logger = useLogger('LoginPage')
  const { setRepoUrl } = useRepoUrlFromLocalStorage()
  const { login, isLoading } = useAuthentication()
  const [url, setUrl] = useState('')

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    try {
      const authService = await getAuthService(url)
      setRepoUrl(url)
      login({ returnUrl: window.location.origin, authService })
    } catch (error) {
      logger.warning({ message: `Couldn't conntect to ${url}`, data: error })
    }
  }

  return (
    <>
      <Grid container={true} direction="row">
        <Container maxWidth="lg" className={classes.topbar}>
          <Link to="/">
            <img src={snLogo} alt="sensenet logo" />
          </Link>
        </Container>
      </Grid>
      <Container maxWidth="sm">
        {isLoading ? (
          <div>
            <FullScreenLoader />
            <p>Login is in progress</p>
          </div>
        ) : (
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
        )}
      </Container>
    </>
  )
}
