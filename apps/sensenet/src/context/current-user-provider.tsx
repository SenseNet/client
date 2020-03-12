import { User } from '@sensenet/default-content-types'
import { useLogger, useRepository } from '@sensenet/hooks-react'
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { ConstantContent } from '@sensenet/client-core/src'
import { getAuthService } from '../services'

const CurrentUserContext = createContext<User | undefined>(undefined)

export function CurrentUserProvider({ children }: PropsWithChildren<{}>) {
  const repository = useRepository()
  const logger = useLogger('current-user-provider')
  const [currentUser, setCurrentUser] = useState<User>()

  useEffect(() => {
    const ac = new AbortController()
    async function getUser() {
      const authService = await getAuthService(repository.configuration.repositoryUrl)
      const user = await authService.getUser()
      if (!user) {
        return
      }

      try {
        const result = await repository.load<User>({
          idOrPath: user.sub,
          oDataOptions: {
            select: 'all',
          },
          requestInit: {
            signal: ac.signal,
          },
        })
        setCurrentUser(result.d)
      } catch (error) {
        if (!ac.signal.aborted) {
          logger.debug({ message: `Couldn't load current user`, data: error })
          setCurrentUser(ConstantContent.VISITOR_USER)
        }
      }
    }
    getUser()
    return () => ac.abort()
  }, [logger, repository])

  if (!currentUser) {
    return null
  }

  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)

  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return context
}
