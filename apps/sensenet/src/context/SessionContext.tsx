import { ConstantContent, LoginState } from '@sensenet/client-core'
import { debounce } from '@sensenet/client-utils'
import { Group, User } from '@sensenet/default-content-types'
import { useContext, useEffect, useState } from 'react'
import React from 'react'
import { RepositoryContext } from './RepositoryContext'

export const SessionContext = React.createContext({
  state: LoginState.Unknown,
  debouncedState: LoginState.Unknown,
  currentUser: ConstantContent.VISITOR_USER as User,
  groups: [] as Group[],
})

export const SessionContextProvider: React.FunctionComponent = props => {
  const repo = useContext(RepositoryContext)
  const [state, setState] = useState(LoginState.Unknown)
  const [debouncedState, setDebouncedState] = useState(LoginState.Unknown)
  const [user, setUser] = useState<User>(ConstantContent.VISITOR_USER as User)
  const [groups, setGroups] = useState<Group[]>([])
  useEffect(() => {
    const updateState = debounce((s: LoginState) => {
      setDebouncedState(s)
    }, 2000)

    const observables = [
      repo.authentication.state.subscribe(s => {
        updateState(s)
        setState(s)
      }, true),
      repo.authentication.currentUser.subscribe(usr => {
        setUser(usr)
        repo.security
          .getParentGroups({
            contentIdOrPath: usr.Id,
            directOnly: false,
            oDataOptions: {
              select: ['Name'],
            },
          })
          .then(result => {
            setGroups(result.d.results)
          })
          .catch(() => setGroups([]))
      }, true),
    ]
    repo.authentication.checkForUpdate()
    return () => observables.forEach(o => o.dispose())
  }, [repo])
  return (
    <SessionContext.Provider value={{ state, currentUser: user, groups, debouncedState }}>
      {props.children}
    </SessionContext.Provider>
  )
}
