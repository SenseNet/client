import { ConstantContent } from '@sensenet/client-core'
import { tuple } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { useLogger } from '@sensenet/hooks-react'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { ResponsivePersonalSetttings } from '../../context'
import { ContentContextService, useRepoState } from '../../services'
import Commander from './Commander'
import { Explore } from './Explore'
import { SimpleList } from './Simple'

export const BrowseType = tuple('commander', 'explorer', 'simple')

export interface BrowseData {
  type?: typeof BrowseType[number]
  root?: string
  currentContent?: number | string
  secondaryContent?: number | string // right parent
  fieldsToDisplay?: Array<keyof GenericContent>
}

export const encodeBrowseData = (data: BrowseData) => encodeURIComponent(btoa(JSON.stringify(data)))
export const decodeBrowseData = (encoded: string) => JSON.parse(atob(decodeURIComponent(encoded))) as BrowseData

export const Content = () => {
  const repository = useRepoState().getCurrentRepository()
  const match = useRouteMatch<{ browseData: string }>()
  const history = useHistory()
  const settings = useContext(ResponsivePersonalSetttings)
  const logger = useLogger('Browse view')

  const [browseData, setBrowseData] = useState<BrowseData>({
    type: settings.content.browseType,
  })

  useEffect(() => {
    try {
      const data = decodeBrowseData(match.params.browseData)
      setBrowseData({
        ...browseData,
        ...data,
      })
    } catch (error) {
      logger.warning({ message: 'Wrong link :(' })
    }
  }, [browseData, logger, match.params.browseData])

  const refreshUrl = useCallback(
    (data: BrowseData, repositoryUrl: string) => {
      history.push(`/${btoa(repositoryUrl)}/browse/${encodeBrowseData(data)}`)
    },
    [history],
  )

  const navigate = useCallback(
    (itm: GenericContent) => {
      if (!repository) {
        logger.debug({ message: 'No repository found.' })
        return
      }
      const newBrowseData = {
        ...browseData,
        currentContent: itm.Id,
      }
      setBrowseData(newBrowseData)
      refreshUrl(newBrowseData, repository.configuration.repositoryUrl)
    },
    [browseData, logger, refreshUrl, repository],
  )

  const navigateSecondary = useCallback(
    (itm: GenericContent) => {
      if (!repository) {
        logger.debug({ message: 'No repository found.' })
        return
      }
      const newBrowseData = {
        ...browseData,
        secondaryContent: itm.Id,
      }
      setBrowseData(newBrowseData)
      refreshUrl(newBrowseData, repository.configuration.repositoryUrl)
    },
    [browseData, logger, refreshUrl, repository],
  )

  const openItem = useCallback(
    (itm: GenericContent) => {
      if (!repository) {
        return
      }
      history.push(new ContentContextService(repository).getPrimaryActionUrl(itm))
    },
    [history, repository],
  )

  return (
    <>
      {browseData.type === 'commander' ? (
        <Commander
          rootPath={browseData.root || ConstantContent.PORTAL_ROOT.Path}
          leftParent={browseData.currentContent || browseData.root || ConstantContent.PORTAL_ROOT.Id}
          rightParent={browseData.secondaryContent || browseData.root || ConstantContent.PORTAL_ROOT.Id}
          onActivateItem={openItem}
          onNavigateLeft={navigate}
          onNavigateRight={navigateSecondary}
          fieldsToDisplay={browseData.fieldsToDisplay}
        />
      ) : browseData.type === 'explorer' ? (
        <Explore
          rootPath={browseData.root || ConstantContent.PORTAL_ROOT.Path}
          onNavigate={navigate}
          onActivateItem={openItem}
          parent={browseData.currentContent || browseData.root || ConstantContent.PORTAL_ROOT.Id}
          fieldsToDisplay={browseData.fieldsToDisplay}
        />
      ) : (
        <SimpleList
          rootPath={browseData.root || ConstantContent.PORTAL_ROOT.Path}
          collectionComponentProps={{
            onActivateItem: openItem,
            onParentChange: navigate,
            fieldsToDisplay: browseData.fieldsToDisplay,
            parentIdOrPath: browseData.currentContent || browseData.root || ConstantContent.PORTAL_ROOT.Id,
          }}
          parent={browseData.currentContent || browseData.root || ConstantContent.PORTAL_ROOT.Id}
        />
      )}
    </>
  )
}

export default Content
