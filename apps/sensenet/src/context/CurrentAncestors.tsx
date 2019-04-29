import { ODataCollectionResponse } from '@sensenet/client-core'
import { debounce } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import Semaphore from 'semaphore-async-await'
import { CurrentContentContext } from './CurrentContent'
import { InjectorContext } from './InjectorContext'
import { RepositoryContext } from './RepositoryContext'
export const CurrentAncestorsContext = React.createContext<GenericContent[]>([])

export const CurrentAncestorsProvider: React.FunctionComponent = props => {
  const currentContent = useContext(CurrentContentContext)
  const [loadLock] = useState(new Semaphore(1))

  const [ancestors, setAncestors] = useState<GenericContent[]>([])
  const repo = useContext(RepositoryContext)
  const injector = useContext(InjectorContext)
  const eventHub = injector.getEventHub(repo.configuration.repositoryUrl)
  const [reloadToken, setReloadToken] = useState(1)

  const requestReload = debounce(() => setReloadToken(Math.random()), 100)

  useEffect(() => {
    const subscriptions = [
      eventHub.onContentModified.subscribe(mod => {
        if (ancestors.map(a => a.Id).includes(mod.content.Id)) {
          requestReload()
        }
      }),
      eventHub.onContentMoved.subscribe(move => {
        if (ancestors.map(a => a.Id).includes(move.content.Id)) {
          requestReload()
        }
      }),
      eventHub.onContentDeleted.subscribe(del => {
        if (ancestors.map(a => a.Id).includes(del.contentData.Id)) {
          requestReload()
        }
      }),
    ]
    return () => subscriptions.forEach(s => s.dispose())
  }, [ancestors, repo])
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        await loadLock.acquire()
        const ancestorsResult = await repo.executeAction<undefined, ODataCollectionResponse<GenericContent>>({
          idOrPath: currentContent.Id,
          method: 'GET',
          name: 'Ancestors',
          body: undefined,
          requestInit: {
            signal: ac.signal,
          },
          oDataOptions: {
            orderby: [['Path', 'asc']],
          },
        })
        setAncestors(ancestorsResult.d.results)
      } catch (error) {
        if (!ac.signal.aborted) {
          setError(error)
        }
      } finally {
        loadLock.release()
      }
    })()
    return () => ac.abort()
  }, [currentContent, repo, reloadToken])

  if (error) {
    throw error
  }
  return <CurrentAncestorsContext.Provider value={ancestors}>{props.children}</CurrentAncestorsContext.Provider>
}
