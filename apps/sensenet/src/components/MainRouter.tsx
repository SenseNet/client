import { LoginState } from '@sensenet/client-core'
import React, { lazy, Suspense, useContext } from 'react'
import { connect } from 'react-redux'
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router'
import { SessionContext } from '../context/SessionContext'
import { rootStateType } from '../store'
import { AuthorizedRoute } from './AuthorizedRoute'
import { ErrorBoundary } from './ErrorBoundary'
import { FullScreenLoader } from './FullScreenLoader'

const mapStateToProps = (state: rootStateType) => ({
  repositoryUrl: state.persistedState.lastRepositoryUrl,
})

const ExploreComponent = lazy(async () => await import(/* webpackChunkName: "content" */ './content'))
const DashboardComponent = lazy(async () => await import(/* webpackChunkName: "dashboard" */ './dashboard'))
const SearchComponent = lazy(async () => await import(/* webpackChunkName: "search" */ './search'))
const IamComponent = lazy(async () => await import(/* webpackChunkName: "iam" */ './iam'))
const SetupComponent = lazy(async () => await import(/* webpackChunkName: "setup" */ './setup'))

const LoginComponent = lazy(async () => await import(/* webpackChunkName: "Login" */ './Login'))
const EditBinary = lazy(async () => await import(/* webpackChunkName: "editBinary" */ './edit/EditBinary'))
const EditProperties = lazy(async () => await import(/* webpackChunkName: "editProperties" */ './edit/EditProperties'))
const DocumentViewerComponent = lazy(async () => await import(/* webpackChunkName: "DocViewer" */ './DocViewer'))

const PersonalSettingsEditor = lazy(
  async () => await import(/* webpackChunkName: "PersonalSettingsEditor" */ './edit/PersonalSettingsEditor'),
)

const MainRouter: React.StatelessComponent<ReturnType<typeof mapStateToProps> & RouteComponentProps> = () => {
  const sessionContext = useContext(SessionContext)

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Switch>
          <AuthorizedRoute path="/personalSettings" render={() => <PersonalSettingsEditor />} authorize={() => true} />

          {/** Requires login */}
          {sessionContext.state === LoginState.Unauthenticated ? (
            <LoginComponent />
          ) : sessionContext.state === LoginState.Authenticated ? (
            <Switch>
              <AuthorizedRoute
                path="/:repo/content/:folderId?/:rightParent?"
                render={() => <ExploreComponent />}
                authorize={() => true}
              />
              <AuthorizedRoute path="/search" render={() => <SearchComponent />} authorize={() => true} />
              <AuthorizedRoute path="/iam" render={() => <IamComponent />} authorize={() => true} />
              <AuthorizedRoute path="/setup" render={() => <SetupComponent />} authorize={() => true} />
              <AuthorizedRoute
                path="/:repo/editBinary/:contentId?"
                render={() => <EditBinary />}
                authorize={() => true}
              />
              <AuthorizedRoute
                path="/:repo/editProperties/:contentId?"
                render={() => <EditProperties />}
                authorize={() => true}
              />
              <AuthorizedRoute
                path="/:repo/preview/:documentId?"
                render={() => <DocumentViewerComponent />}
                authorize={() => true}
              />
              <Route path="/" render={() => <DashboardComponent />} />
            </Switch>
          ) : (
            <FullScreenLoader />
          )}
        </Switch>
      </Suspense>
    </ErrorBoundary>
  )
}

const connectedComponent = withRouter(connect(mapStateToProps)(MainRouter))

export { connectedComponent as MainRouter }
