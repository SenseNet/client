import { LoginState } from '@sensenet/client-core'
import { LoadSettingsContextProvider, RepositoryContext, useSession } from '@sensenet/hooks-react'
import React, { lazy, Suspense, useEffect, useRef } from 'react'
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router'
import { usePersonalSettings } from '../hooks'
import { ErrorBoundary } from './error-boundary'
import { ErrorBoundaryWithDialogs } from './error-boundary-with-dialogs'
import { FullScreenLoader } from './FullScreenLoader'
import { WopiPage } from './wopi-page'

const ExploreComponent = lazy(async () => await import(/* webpackChunkName: "content" */ './content'))
const DashboardComponent = lazy(async () => await import(/* webpackChunkName: "dashboard" */ './dashboard'))
const SearchComponent = lazy(async () => await import(/* webpackChunkName: "search" */ './search'))
const SavedQueriesComponent = lazy(
  async () => await import(/* webpackChunkName: "saved-queries" */ './search/saved-queries'),
)
const SetupComponent = lazy(async () => await import(/* webpackChunkName: "setup" */ './setup'))

const LoginComponent = lazy(async () => await import(/* webpackChunkName: "Login" */ './login/Login'))
const EditBinary = lazy(async () => await import(/* webpackChunkName: "editBinary" */ './edit/EditBinary'))
const EditProperties = lazy(async () => await import(/* webpackChunkName: "editProperties" */ './edit/EditProperties'))
const BrowseProperties = lazy(
  async () => await import(/* webpackChunkName: "browseProperties" */ './browse/BrowseProperties'),
)
const NewProperties = lazy(async () => await import(/* webpackChunkName: "newProperties" */ './new/NewProperties'))
const DocumentViewerComponent = lazy(async () => await import(/* webpackChunkName: "DocViewer" */ './DocViewer'))

const TrashComponent = lazy(async () => await import(/* webpackChunkName: "Trash" */ './trash/Trash'))
const UsersAndGroupsComponent = lazy(
  async () => await import(/* webpackChunkName: "UserAndGroup" */ './users-and-groups/users-and-groups'),
)
const LocalizationComponent = lazy(
  async () => await import(/* webpackChunkName: "Trash" */ './localization/localization'),
)
const EventListComponent = lazy(async () => await import(/* webpackChunkName: "EventList" */ './event-list'))

const PersonalSettingsEditor = lazy(
  async () => await import(/* webpackChunkName: "PersonalSettingsEditor" */ './edit/PersonalSettingsEditor'),
)

const MainRouter: React.StatelessComponent<RouteComponentProps> = props => {
  const sessionContext = useSession()
  const personalSettings = usePersonalSettings()
  const previousLocation = useRef<string>()

  useEffect(() => {
    const listen = props.history.listen(location => {
      /**
       *  Do not add preview locations to previousLocation
       *  this way the user can go back to the location where she
       *  opened the viewer.
       * */
      if (location.pathname.includes('/Preview')) {
        return
      }
      previousLocation.current = location.pathname
    })
    return () => {
      listen()
    }
  }, [props.history])

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryWithDialogs}>
      <Route
        render={({ location }) =>
          sessionContext.state === LoginState.Unauthenticated || !personalSettings.lastRepository ? (
            <Redirect to={{ pathname: '/login', state: { from: location } }} />
          ) : (
            <>
              <Suspense fallback={<FullScreenLoader />}>
                <Switch>
                  <Route
                    path="/personalSettings"
                    render={() => {
                      return <PersonalSettingsEditor />
                    }}
                  />
                  <Route
                    path="/:repo/login"
                    render={() => {
                      return <LoginComponent />
                    }}
                  />
                  <Route
                    path="/events/:eventGuid?"
                    render={() => {
                      return <EventListComponent />
                    }}
                  />
                  <Route
                    path="/:repo/browse/:browseData?"
                    render={routeProps => {
                      return <ExploreComponent {...routeProps} />
                    }}
                  />
                  <Route path="/:repo/search/:queryData?">
                    <LoadSettingsContextProvider>
                      <SearchComponent />
                    </LoadSettingsContextProvider>
                  </Route>
                  <Route
                    path="/:repo/saved-queries"
                    render={() => {
                      return (
                        <LoadSettingsContextProvider>
                          <SavedQueriesComponent />
                        </LoadSettingsContextProvider>
                      )
                    }}
                  />
                  <Route
                    path="/:repo/setup"
                    render={() => {
                      return <SetupComponent />
                    }}
                  />
                  <Route
                    path="/:repo/trash"
                    render={() => {
                      return <TrashComponent />
                    }}
                  />
                  <Route
                    path="/:repo/localization"
                    render={() => {
                      return <LocalizationComponent />
                    }}
                  />
                  <Route
                    path="/:repo/usersAndGroups"
                    render={() => {
                      return <UsersAndGroupsComponent />
                    }}
                  />
                  <Route
                    path="/:repo/editBinary/:contentId?"
                    render={() => {
                      return <EditBinary />
                    }}
                  />
                  <Route
                    path="/:repo/editProperties/:contentId?"
                    render={() => {
                      return <EditProperties />
                    }}
                  />
                  <Route
                    path="/:repo/browseProperties/:contentId?"
                    render={() => {
                      return <BrowseProperties />
                    }}
                  />
                  <Route
                    path="/:repo/newProperties/:contentId?"
                    render={() => {
                      return <NewProperties />
                    }}
                  />
                  <Route
                    path="/:repo/preview/:documentId?"
                    render={() => {
                      return <DocumentViewerComponent previousLocation={previousLocation.current} />
                    }}
                  />
                  <Route path="/:repo/wopi/:documentId/:action?">
                    <WopiPage />
                  </Route>
                  <Route
                    path="/:repo/dashboard/:dashboardName?"
                    render={routeParams => {
                      return (
                        <RepositoryContext.Consumer>
                          {repo => <DashboardComponent repository={repo} {...routeParams} />}
                        </RepositoryContext.Consumer>
                      )
                    }}
                  />
                  <Route
                    path="/:repo/"
                    exact
                    render={routeParams => {
                      return (
                        <RepositoryContext.Consumer>
                          {repo => <DashboardComponent repository={repo} {...routeParams} />}
                        </RepositoryContext.Consumer>
                      )
                    }}
                  />
                  <Route
                    path="/"
                    exact
                    render={routeParams => {
                      return <DashboardComponent {...routeParams} />
                    }}
                  />
                </Switch>
              </Suspense>
            </>
          )
        }
      />
    </ErrorBoundary>
  )
}

const connectedComponent = withRouter(MainRouter)

export { connectedComponent as MainRouter }
