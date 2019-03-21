import { Content, ODataCollectionResponse, ODataParams, ODataResponse, Repository } from '@sensenet/client-core'
import { ValueObserver } from '@sensenet/client-utils'
import { ActionModel, GenericContent, Group, User } from '@sensenet/default-content-types'
import { createAction } from '@sensenet/redux'
import { EventHub } from '@sensenet/repository-events'
import { Action } from 'redux'
import { IInjectableActionCallbackParams } from 'redux-di-middleware'
import { changedContent } from '../../Actions'
import { debounceReloadOnProgress } from '../../Actions'
import { arrayComparer, arrayDiff } from '../../assets/helpers'
import { rootStateType } from '../../store/rootReducer'

const eventObservables: Array<ValueObserver<any>> = []

export const startLoading = (idOrPath: number | string) => ({
  type: 'DMS_USERSANDGROUPS_LOADING',
  idOrPath,
})

export const loadUser = <T extends User = User>(idOrPath: number | string, userOptions?: ODataParams<T>) => ({
  type: 'DMS_USERSANDGROUPS_LOAD_USER',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const prevState = options.getState().dms.usersAndGroups
    if (prevState.user.currentUser && prevState.user.currentUser.Id.toString() === idOrPath) {
      return
    }

    eventObservables.forEach(o => o.dispose())
    eventObservables.length = 0

    const eventHub = options.getInjectable(EventHub)

    options.dispatch(startLoading(idOrPath))

    try {
      const repository = options.getInjectable(Repository)
      const newUser = await repository.load<T>({
        idOrPath,
        oDataOptions: userOptions,
      })
      options.dispatch(setUser(newUser.d))
      const emitChange = (content: User) => {
        changedContent.push(content)
      }

      eventObservables.push(
        eventHub.onCustomActionExecuted.subscribe(() => {
          emitChange({ Id: newUser.d.Id } as User)
        }),
        eventHub.onContentCreated.subscribe(value => emitChange(value.content)),
        eventHub.onContentModified.subscribe(value => emitChange(value.content)),
        eventHub.onContentMoved.subscribe(value => emitChange(value.content)),
        eventHub.onContentDeleted.subscribe(value => {
          const currentItems = options.getState().dms.documentLibrary.items
          const filtered = currentItems.d.results.filter(item => item.Id !== value.contentData.Id)
          options.dispatch(
            setGroups({
              ...currentItems,
              d: {
                __count: filtered.length,
                results: filtered,
              },
            }),
          )
        }) as any,
      )

      await Promise.all([
        (async () => {
          const ancestors = await repository.executeAction<undefined, ODataCollectionResponse<GenericContent>>({
            idOrPath: newUser.d.Id,
            method: 'GET',
            name: 'Ancestors',
            body: undefined,
            oDataOptions: {
              orderby: [['Path', 'asc']],
            },
          })
          options.dispatch(setAncestors([...ancestors.d.results, newUser.d]))
        })(),
        (async () => {
          const memberships = await repository.security.getParentGroups({
            contentIdOrPath: idOrPath,
            directOnly: false,
            oDataOptions: {
              select: ['Workspace', 'DisplayName', 'Type', 'Id', 'Path', 'Actions', 'Icon', 'Members'],
              expand: ['Workspace', 'Actions', 'Members'],
              filter: `isOf('Group')`,
            },
          })
          options.dispatch(setMemberships(memberships))
        })(),
      ])
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
    }
  },
})

export const setUser: <T extends User = User>(content: T) => Action & { content: T } = <T>(content: T) => ({
  type: 'DMS_USERSANDGROUPS_SET_USER',
  content,
})

export const setMemberships = (items: ODataCollectionResponse<GenericContent>) => ({
  type: 'DMS_USERSANDGROUPS_SET_MEMBERSHIPS',
  items,
})

export const setAncestors = <T extends GenericContent>(ancestors: T[]) => ({
  type: 'DMS_USERSANDGROUPS_SET_ANCESTORS',
  ancestors,
})

export const setError = (error?: any) => ({
  type: 'DMS_USERSANDGROUPS_SET_ERROR',
  error,
})

export const finishLoading = () => ({
  type: 'DMS_USERSANDGROUPS_FINISH_LOADING',
})

export const setGroupOptions = <T extends GenericContent>(odataOptions: ODataParams<T>) => ({
  type: 'DMS_USERSANDGROUPS_SET_GROUP_OPTIONS',
  odataOptions,
})

export const userIsAdmin = (userPath: string) => ({
  type: 'DMS_USER_ISADMIN',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const repository = options.getInjectable(Repository)
    const payload = await repository.security.getParentGroups({
      contentIdOrPath: userPath,
      directOnly: false,
      oDataOptions: {
        select: 'Name',
      },
    })
    const groups = payload.d.results as Group[]
    const admin = groups.find(group => group.Name === 'DMSAdmins')
    options.dispatch(isAdmin(admin ? true : false))
  },
})

export const isAdmin = (admin: boolean = false) => ({
  type: 'DMS_USER_ISADMIN',
  admin,
})

export const setActive = <T extends GenericContent>(active?: T) => ({
  type: 'DMS_USERSANDGROUPS_SET_ACTIVE',
  active,
})

export const updateChildrenOptions = <T extends GenericContent>(o: ODataParams<T>) => ({
  type: 'DMS_USERSANDGROUPS_UPDATE_CHILDREN_OPTIONS',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const repository = options.getInjectable(Repository)
    options.dispatch(
      startLoading(
        currentState.dms.usersAndGroups.user.currentUser ? currentState.dms.usersAndGroups.user.currentUser.Id : '',
      ),
    )
    try {
      const items = await repository.security.getParentGroups({
        contentIdOrPath: currentState.dms.usersAndGroups.user.currentUser
          ? currentState.dms.usersAndGroups.user.currentUser.Id
          : 0,
        directOnly: false,
        oDataOptions: {
          ...{
            select: ['Workspace', 'DisplayName', 'Type', 'Id', 'Path', 'Actions', 'Icon', 'Members'],
            expand: ['Workspace', 'Actions', 'Members'],
            filter: `isOf('Group')`,
          },
          ...(o as any),
        },
      })
      options.dispatch(setMemberships(items))
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
      options.dispatch(setChildrenOptions(o))
    }
  },
})

export const setChildrenOptions = <T extends GenericContent>(odataOptions: ODataParams<T>) => ({
  type: 'DMS_USERSANDGROUPS_SET_CHILDREN_OPTIONS',
  odataOptions,
})

export const removeMemberFromGroups = (contentIds: number[], groups: Group[]) => ({
  type: 'DMS_USERSANDGROUPS_REMOVE_MEMBER',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const repository = options.getInjectable(Repository)
    options.dispatch(
      startLoading(
        currentState.dms.usersAndGroups.user.currentUser ? currentState.dms.usersAndGroups.user.currentUser.Id : '',
      ),
    )
    try {
      const remove = groups.map(async group => {
        return await repository.security.removeMembers(group.Id, contentIds)
      })
      await Promise.all(remove)
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      const comparedList = arrayComparer(groups, currentState.dms.usersAndGroups.user.memberships.d.results)
      options.dispatch(updateGroupList({ d: { __count: comparedList.length, results: comparedList } }))
      options.dispatch(loadUser(contentIds[0]))
      options.dispatch(finishLoading())
      options.dispatch(getGroups(currentState.dms.usersAndGroups.user.memberships))
    }
  },
})

export const selectGroup = (groups: GenericContent[] | GenericContent) => {
  return {
    type: 'DMS_USERSANDGROUPS_SELECT_GROUP',
    groups,
  }
}

export const deselectGroup = (id: number) => ({
  type: 'DMS_USERSANDGROUPS_DESELECT_GROUP',
  id,
})

export const getGroups = (memberships: ODataCollectionResponse<Group>) => ({
  type: 'DMS_USERSANDGROUPS_GET_GROUPS',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const repository = options.getInjectable(Repository)
    options.dispatch(
      startLoading(
        currentState.dms.usersAndGroups.user.currentUser ? currentState.dms.usersAndGroups.user.currentUser.Id : '',
      ),
    )
    try {
      const groups = await repository.loadCollection({
        path: '/Root',
        oDataOptions: {
          query: '+TypeIs:Group',
          select: ['DisplayName', 'Path', 'Actions'] as any,
          expand: ['Actions'] as any,
        },
      })
      const comparedList = arrayDiff(groups.d.results, memberships.d.results)
      const newGroups = {
        d: {
          __count: comparedList.length,
          results: comparedList.filter((group: Group) => {
            const actions = group.Actions as ActionModel[]
            return actions ? actions.find((action: ActionModel) => action.Name === 'Edit') : []
          }),
        },
      }
      options.dispatch(setGroups(newGroups))
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
    }
  },
})
export const setGroups = (groups: ODataCollectionResponse<Group>) => ({
  type: 'DMS_USERSANDGROUPS_SET_GROUPS',
  groups,
})

export const searchGroups = (text: string) => ({
  type: 'DMS_USERSANDGROUPS_SEARCH_GROUPS',
  text,
})

export const clearSelection = () => ({
  type: 'DMS_USERSANDGROUPS_CLEAR_SELECTION',
})

export const addUserToGroups = (user: User, groups: Group[]) => ({
  type: 'DMS_USERSANDGROUPS_ADD_USER_TO_GROUPS',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const repository = options.getInjectable(Repository) as Repository
    options.dispatch(
      startLoading(
        currentState.dms.usersAndGroups.user.currentUser ? currentState.dms.usersAndGroups.user.currentUser.Id : '',
      ),
    )
    try {
      const add = groups.map(async group => {
        return await repository.security.addMembers(group.Id, [user.Id])
      })
      await Promise.all(add)
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
      options.dispatch(loadUser(user.Id))
      const comparedList = arrayComparer(groups, currentState.dms.usersAndGroups.user.memberships.d.results)
      options.dispatch(updateGroupList({ d: { __count: comparedList.length, results: comparedList } }))
    }
  },
})

export const updateGroupList = (groups: ODataCollectionResponse<Group>) => ({
  type: 'DMS_USERSANDGROUPS_UPDATE_GROUPS',
  groups,
})

export const startLoadingChildren = createAction((idOrPath: number | string) => ({
  type: 'DMS_USERSANDGROUPS_LOADING_CHILDREN',
  idOrPath,
}))

export const updateGroupListOptions = createAction(<T extends GenericContent>(odataOptions: ODataParams<T>) => ({
  type: 'DMS_SERSANDGROUPS_UPDATE_GROUPLIST_OPTIONS',
  odataOptions,
  // tslint:disable-next-line: no-unnecessary-type-annotation
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const parentPath = currentState.dms.usersAndGroups.group.parent
      ? currentState.dms.usersAndGroups.group.parent.Path
      : ''
    const repository = options.getInjectable(Repository)
    options.dispatch(
      startLoadingChildren(
        currentState.dms.usersAndGroups.group.parentIdOrPath
          ? currentState.dms.usersAndGroups.group.parentIdOrPath
          : '',
      ),
    )
    try {
      const items = await repository.loadCollection({
        path: parentPath,
        oDataOptions: {
          ...options.getState().dms.documentLibrary.childrenOptions,
          ...odataOptions,
        },
      })
      options.dispatch(setGroups(items))
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoadingChildren())
      options.dispatch(setChildrenOptions(odataOptions))
    }
  },
}))

export const finishLoadingChildren = createAction(() => ({
  type: 'DMS_SERSANDGROUPS_FINISH_LOADING_CHILDREN',
}))

export const loadGroup = <T extends Group = Group>(idOrPath: number | string, groupOptions?: ODataParams<T>) => ({
  type: 'DMS_USERSANDGROUPS_LOAD_GROUP',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const prevState = options.getState().dms.usersAndGroups
    if (prevState.group.currentGroup && prevState.group.currentGroup.Id.toString() === idOrPath) {
      return
    }

    eventObservables.forEach(o => o.dispose())
    eventObservables.length = 0

    const eventHub = options.getInjectable(EventHub)

    options.dispatch(startLoading(idOrPath))

    try {
      const repository = options.getInjectable(Repository)
      const newGroup = await repository.load<T>({
        idOrPath,
        oDataOptions: groupOptions,
      })
      let items = {} as ODataCollectionResponse<Content>
      let realGroup = {} as ODataResponse<T>
      const WS_TYPES = ['ProjectWorkspace', 'DocumentWorkspace', 'SalesWorkspace']
      if (WS_TYPES.indexOf(newGroup.d.Type) > -1) {
        items = await repository.loadCollection({
          path: idOrPath as string,
          oDataOptions: {
            select: ['Path', 'Actions', 'Id', 'DisplayName', 'Name', 'IsFolder', 'Icon'] as any,
            expand: ['Actions'] as any,
            query: `InTree:${newGroup.d.Path} AND TypeIs:Group .AUTOFILTERS:OFF`,
          },
        })
        realGroup = await repository.load<T>({
          idOrPath: `${newGroup.d.Path}/Groups`,
          oDataOptions: groupOptions,
        })
      } else {
        items = await repository.loadCollection({
          path: idOrPath as string,
          oDataOptions: {
            select: ['Path', 'Actions', 'Id', 'DisplayName', 'Name', 'IsFolder', 'Icon'] as any,
            expand: ['Actions'] as any,
            filter: `IsFolder eq true and ContentType ne 'SystemFolder' or ContentType eq 'Group'`,
          },
        })
      }
      options.dispatch(setGroup(realGroup.d || newGroup.d, items.d.results))

      const emitChange = (content: Group) => {
        changedContent.push(content)
        debounceReloadOnProgress(options.getState, options.dispatch)
      }

      eventObservables.push(
        eventHub.onCustomActionExecuted.subscribe(() => {
          emitChange({ Id: realGroup.d ? realGroup.d.Id : newGroup.d.Id } as Group)
        }),
        eventHub.onContentCreated.subscribe(value => emitChange(value.content)),
        eventHub.onContentModified.subscribe(value => emitChange(value.content)),
        eventHub.onContentMoved.subscribe(value => emitChange(value.content)),
      )

      await Promise.all([
        (async () => {
          const ancestors = await repository.executeAction<undefined, ODataCollectionResponse<GenericContent>>({
            idOrPath: newGroup.d.Id,
            method: 'GET',
            name: 'Ancestors',
            body: undefined,
            oDataOptions: {
              orderby: [['Path', 'asc']],
            },
          })
          options.dispatch(setGroupAncestors([...ancestors.d.results, newGroup.d]))
        })(),
      ])
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
    }
  },
})

export const setGroup: <T extends Group = Group>(content: T, items: T[]) => Action & { content: T; items: T[] } = <T>(
  content: T,
  // tslint:disable-next-line: no-unnecessary-type-annotation
  items: T[],
) => ({
  type: 'DMS_USERSANDGROUPS_SET_GROUP',
  content,
  items,
})

export const setGroupAncestors = <T extends GenericContent>(ancestors: T[]) => ({
  type: 'DMS_USERSANDGROUPS_SET_GROUPANCESTORS',
  ancestors,
})

export const getUsers = () => ({
  type: 'DMS_USERSANDGROUPS_GET_USERS',
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const repository = options.getInjectable(Repository)
    options.dispatch(
      startLoading(
        currentState.dms.usersAndGroups.user.currentUser ? currentState.dms.usersAndGroups.user.currentUser.Id : '',
      ),
    )
    try {
      const users = await repository.loadCollection({
        path: '/Root/IMS',
        oDataOptions: {
          query: '+TypeIs:User',
          select: ['FullName', 'Path', 'Actions', 'Id'] as any,
          expand: ['Actions'] as any,
        },
      })
      options.dispatch(setUsers(users))
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoading())
    }
  },
})

export const setUsers = (users: ODataCollectionResponse<Group>) => ({
  type: 'DMS_USERSANDGROUPS_SET_USERS',
  users,
})

export const searchUsers = (text: string) => ({
  type: 'DMS_USERSANDGROUPS_SEARCH_USERS',
  text,
})

export const getAllowedTypes = createAction(<T extends GenericContent[]>(odataOptions: ODataParams<T>) => ({
  type: 'DMS_DOCLIB_GET_ALLOWED_TYPES',
  odataOptions,
  // tslint:disable-next-line: no-unnecessary-type-annotation
  inject: async (options: IInjectableActionCallbackParams<rootStateType>) => {
    const currentState = options.getState()
    const currentPath = currentState.dms.usersAndGroups.group.currentGroup
      ? currentState.dms.usersAndGroups.group.currentGroup.Path
      : ''
    const repository = options.getInjectable(Repository)

    try {
      const response = await repository.getAllowedChildTypes({
        idOrPath: currentPath,
        oDataOptions: { metadata: 'no', select: ['Name'] },
      })
      options.dispatch(setAllowedChildTypes(response.d.results))
    } catch (error) {
      options.dispatch(setError(error))
    } finally {
      options.dispatch(finishLoadingChildren())
    }
  },
}))

export const setAllowedChildTypes = createAction((types: GenericContent[]) => ({
  type: 'DMS_DOCLIB_SET_ALLOWED_TYPES',
  types,
}))
