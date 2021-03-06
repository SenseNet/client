import { UserManagerSettings } from '@sensenet/authentication-oidc-react'
import { PATHS } from '../application-paths'
import { pathWithQueryParams } from '.'

let config: UserManagerSettings
let currentRepoUrl: string

export const getAuthConfig = async (repoUrl: string) => {
  if (config && repoUrl === currentRepoUrl) {
    return config
  }

  const trimmedRepoUrl = repoUrl.replace(/\/\s*$/, '')
  const response = await fetch(`${trimmedRepoUrl}/odata.svc/('Root')/GetClientRequestParameters?clientType=adminui`)
  if (!response.ok) {
    throw new Error(`Could not load settings`)
  }

  const settings = await response.json()
  const mySettings: UserManagerSettings = {
    automaticSilentRenew: true,
    redirect_uri: window.location.origin + PATHS.loginCallback.appPath,
    response_type: 'code',
    scope: 'openid profile sensenet',
    post_logout_redirect_uri: pathWithQueryParams({
      path: window.location.origin,
      newParams: { repoUrl },
    }),
    silent_redirect_uri: window.location.origin + PATHS.silentCallback.appPath,
    extraQueryParams: { snrepo: trimmedRepoUrl },
  }

  const userManagerSettings = { ...settings, ...mySettings }
  currentRepoUrl = repoUrl
  return userManagerSettings
}
