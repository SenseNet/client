import AppBar from '@material-ui/core/AppBar'
import Checkbox from '@material-ui/core/Checkbox'
import { MuiThemeProvider } from '@material-ui/core/styles'
import TableCell from '@material-ui/core/TableCell'
import Toolbar from '@material-ui/core/Toolbar'
import { ConstantContent } from '@sensenet/client-core'
import { ActionModel, GenericContent, SchemaStore } from '@sensenet/default-content-types'
import { ContentList } from '@sensenet/list-controls-react'
import { compile } from 'path-to-regexp'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive'
import { RouteComponentProps, withRouter } from 'react-router'
import { closeActionMenu, openActionMenu } from '../Actions'
import { contentListTheme } from '../assets/contentlist'
import { icons } from '../assets/icons'
import { customSchema } from '../assets/schema'
import { rootStateType } from '../store/rootReducer'
import { loadGroup, selectGroup, updateChildrenOptions } from '../store/usersandgroups/actions'
import BreadCrumb from './BreadCrumb'
import { DisplayNameCell } from './ContentList/CellTemplates/DisplayNameCell'
import { DisplayNameMobileCell } from './ContentList/CellTemplates/DisplayNameMobileCell'
import { FullScreenLoader } from './FullScreenLoader'
import UserSelector from './UsersAndGroups/UserSelector/UserSelector'

const rootItems = [
  {
    Name: 'IMS',
    DisplayName: 'Users and Groups',
    Path: '/Root/IMS',
    Icon: 'folder',
    Id: 3,
  } as GenericContent,
  {
    Name: 'Workspaces',
    DisplayName: 'Workspaces',
    Path: '/Root/Sites/Default_Site/workspaces',
    Icon: 'folder',
    Id: 3778,
  } as GenericContent,
]

const styles = {
  appBar: {
    background: '#fff',
    boxShadow: 'none',
  },
  appBarMobile: {
    background: '#4cc9f2',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    padding: '0 12px',
  },
  toolbarMobile: {
    padding: '0',
    minHeight: 36,
    borderBottom: 'solid 1px #fff',
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    fontSize: 15,
    fontFamily: 'Raleway SemiBold',
  },
  icon: {
    marginRight: 5,
  },
}

interface GroupsProps extends RouteComponentProps<any> {
  matchesDesktop: boolean
}

interface GroupsState {
  groupName: string
}

const mapStateToProps = (state: rootStateType) => {
  return {
    loggedinUser: state.sensenet.session.user,
    isAdmin: state.dms.usersAndGroups.user.isAdmin,
    group: state.dms.usersAndGroups.group.currentGroup,
    ancestors: state.dms.usersAndGroups.group.ancestors,
    isLoading: state.dms.usersAndGroups.group.isLoading,
    items: state.dms.usersAndGroups.group.groupList,
    childrenOptions: state.dms.usersAndGroups.group.grouplistOptions,
    hostName: state.sensenet.session.repository ? state.sensenet.session.repository.repositoryUrl : '',
    selected: state.dms.usersAndGroups.group.selected,
  }
}

const mapDispatchToProps = {
  loadGroup,
  openActionMenu,
  closeActionMenu,
  selectGroup,
  updateChildrenOptions,
}

class Groups extends Component<
  ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & GroupsProps,
  GroupsState
> {
  constructor(props: Groups['props']) {
    super(props)
    this.state = {
      groupName: '',
    }
  }
  private static updateStoreFromPath(newProps: Groups['props']) {
    try {
      const idFromUrl = newProps.match.params.folderPath && atob(decodeURIComponent(newProps.match.params.otherActions))
      const groupsRootPath = `/Root`
      newProps.loadGroup(Number(idFromUrl) || groupsRootPath, {
        select: ['Icon', 'Name', 'Path', 'DisplayName'],
      })
    } catch (error) {
      /** Cannot parse current folder from URL */
      return compile(newProps.match.path)({ folderPath: '' })
    }
  }
  public static getDerivedStateFromProps(newProps: Groups['props'], lastState: Groups['state']) {
    if (newProps.group === null || (newProps.group && newProps.group.Name !== lastState.groupName)) {
      const newPath = Groups.updateStoreFromPath(newProps)
      if (newPath && newPath !== newProps.match.url) {
        newProps.history.push(newPath)
      }
    }
    return {
      ...lastState,
      groupName: newProps.group ? newProps.group.Name : '',
    } as Groups['state']
  }
  public handleDeleteClick = () => {
    // TODO: delete currentGroup
  }
  public isGroupAdmin = (actions: ActionModel[] | undefined) => {
    const editAction = actions ? actions.find((action: ActionModel) => action.Name === 'Edit') : undefined
    return editAction ? !editAction.Forbidden : false
  }
  public handleRowDoubleClick(_e: React.MouseEvent, content: GenericContent) {
    const { group, match, history } = this.props
    if (content.IsFolder) {
      const newPath = compile(match.path)({ folderPath: btoa(content.Path) })
      history.push(newPath)
    } else {
      const newPath = compile(match.path)({
        folderPath: match.params.folderPath || btoa(group ? group.Path : ''),
        otherActions: ['browse', btoa(content.Id as any)],
      })
      history.push(newPath)
    }
  }
  public render() {
    const {
      ancestors,
      childrenOptions,
      group,
      hostName,
      isLoading,
      items,
      loggedinUser,
      matchesDesktop,
      selected,
    } = this.props
    return (
      <MediaQuery minDeviceWidth={700}>
        {matches => {
          return loggedinUser.content.Id !== ConstantContent.VISITOR_USER.Id ? (
            <div>
              {this.props.isAdmin ? (
                <AppBar position="static" style={matches ? styles.appBar : styles.appBarMobile}>
                  <Toolbar style={matches ? (styles.toolbar as any) : (styles.toolbarMobile as any)}>
                    <div style={{ flex: 1, display: 'flex' }}>
                      {group ? (
                        <BreadCrumb
                          ancestors={ancestors}
                          currentContent={group}
                          typeFilter={['OrganizationalUnit', 'Folder', 'Domain']}
                        />
                      ) : null}
                      <UserSelector />
                    </div>
                  </Toolbar>
                </AppBar>
              ) : null}
              <MuiThemeProvider theme={contentListTheme}>
                {isLoading ? (
                  <FullScreenLoader />
                ) : (
                  <ContentList
                    displayRowCheckbox={matches ? true : false}
                    items={items.length > 0 ? items : rootItems}
                    schema={
                      customSchema.find(s => s.ContentTypeName === 'GenericContent') ||
                      SchemaStore.filter(s => s.ContentTypeName === 'GenericContent')[0]
                    }
                    fieldsToDisplay={matches ? ['DisplayName', 'Path', 'Actions'] : ['DisplayName', 'Actions']}
                    icons={icons}
                    orderBy={childrenOptions.orderby ? childrenOptions.orderby[0][0] : ('Id' as any)}
                    orderDirection={childrenOptions.orderby ? childrenOptions.orderby[0][1] : ('asc' as any)}
                    onRequestSelectionChange={newSelection => this.props.selectGroup(newSelection)}
                    onRequestActionsMenu={(ev, content) => {
                      ev.preventDefault()
                      this.props.closeActionMenu()
                      this.props.openActionMenu(
                        content.Actions as ActionModel[],
                        content,
                        '',
                        ev.currentTarget.parentElement,
                        { top: ev.clientY, left: ev.clientX },
                      )
                    }}
                    onItemContextMenu={(ev, content) => {
                      ev.preventDefault()
                      this.props.closeActionMenu()
                      this.props.openActionMenu(
                        content.Actions as ActionModel[],
                        content,
                        '',
                        ev.currentTarget.parentElement,
                        { top: ev.clientY, left: ev.clientX },
                      )
                    }}
                    onRequestOrderChange={(field, direction) => {
                      if (field !== 'Workspace' && field !== 'Actions') {
                        this.props.updateChildrenOptions({
                          ...childrenOptions,
                          orderby: [[field, direction]],
                        })
                      }
                    }}
                    selected={selected}
                    onItemDoubleClick={this.handleRowDoubleClick}
                    fieldComponent={props => {
                      switch (props.field) {
                        case 'DisplayName':
                          if (!matchesDesktop) {
                            return (
                              <DisplayNameMobileCell
                                content={props.content}
                                isSelected={props.isSelected}
                                hasSelected={props.selected ? props.selected.length > 0 : false}
                                icons={icons}
                                onActivate={(ev, content) => this.handleRowDoubleClick(ev, content)}
                              />
                            )
                          } else {
                            return (
                              <DisplayNameCell
                                content={props.content}
                                isSelected={props.isSelected}
                                icons={icons}
                                hostName={hostName}
                              />
                            )
                          }
                        case 'Actions':
                          // tslint:disable-next-line:no-string-literal
                          if (this.isGroupAdmin(props.content.Actions as ActionModel[])) {
                            return <div>aaa</div> // TODO: delete group
                          } else {
                            return <TableCell />
                          }
                        default:
                          return null
                      }
                    }}
                    getSelectionControl={(_selected, content) => {
                      return (
                        <Checkbox
                          checked={selected.find((i: GenericContent) => i.Id === content.Id) ? true : false}
                          disabled={this.isGroupAdmin(content.Actions as ActionModel[]) ? false : true}
                          style={this.isGroupAdmin(content.Actions as ActionModel[]) ? { cursor: 'normal' } : {}}
                        />
                      )
                    }}
                  />
                )}
              </MuiThemeProvider>
            </div>
          ) : null
        }}
      </MediaQuery>
    )
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Groups),
)
