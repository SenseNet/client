import { LoginState } from '@sensenet/client-core'
import React from 'react'
import Loadable from 'react-loadable'
import { connect } from 'react-redux'
import { Route, RouteComponentProps, Switch } from 'react-router-dom'
import * as DMSActions from '../Actions'
import { FullScreenLoader } from '../components/FullScreenLoader'
// import Header from '../components/Header'
import { repository } from '../DmsRepository'
import { rootStateType } from '../store/rootReducer'

const mapStateToProps = (state: rootStateType) => {
  return {
    loggedinUser: state.sensenet.session.user,
    loginState: state.sensenet.session.loginState,
    userActions: state.dms.actionmenu.actions,
  }
}

const mapDispatchToProps = {
  loadUserActions: DMSActions.loadUserActions,
}

interface DashboardProps extends RouteComponentProps<any> {
  currentId: number
}

export interface DashboardState {
  currentSelection: number[]
  currentScope: string
  currentViewName: string
  currentUserName: string
}

class DashboardComponent extends React.Component<
  DashboardProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps,
  DashboardState
> {
  public state = {
    currentFolderId: undefined,
    currentSelection: [],
    currentViewName: 'edit',
    currentUserName: this.props.loggedinUser.userName || 'Visitor',
    currentScope: 'documents',
  }

  constructor(props: DashboardComponent['props']) {
    super(props)
  }

  public static getDerivedStateFromProps(
    newProps: DashboardComponent['props'],
    lastState: DashboardComponent['state'],
  ) {
    const currentSelection =
      (newProps.match.params.selection && decodeURIComponent(newProps.match.params.selection)) || []
    const currentViewName = newProps.match.params.action

    if (
      newProps.loggedinUser.userName !== lastState.currentUserName ||
      (newProps.loggedinUser.userName !== 'Visitor' && newProps.userActions.length === 0)
    ) {
      newProps.loadUserActions(newProps.loggedinUser.content.Path, 'DMSUserActions')
    }

    return {
      ...lastState,
      currentSelection,
      currentViewName,
      currentScope: newProps.match.params.scope || 'documents',
      currentUserName: newProps.loggedinUser.userName,
    }
  }
  public render() {
    if (this.props.loginState !== LoginState.Unauthenticated && this.props.loggedinUser.userName === 'Visitor') {
      return null
    }

    return (
      <div>
        {/* <Header />
        <div> */}
        <Switch>
          <Route
            exact={true}
            path="/wopi/:documentId?"
            component={() => {
              const LoadableEditorPage = Loadable({
                loader: async () => await import(/* webpackChunkName: "viewer" */ '../components/Wopi/EditorPage'),
                loading: () => <FullScreenLoader />,
              })
              return <LoadableEditorPage repository={repository} />
            }}
          />
        </Switch>
        {/* </div> */}
      </div>
    )
  }
}
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardComponent)

export default connectedComponent
