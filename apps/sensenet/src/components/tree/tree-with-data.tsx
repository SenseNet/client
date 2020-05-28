import { PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { CurrentContentContext, useLogger, useRepository, useRepositoryEvents } from '@sensenet/hooks-react'
import { Created } from '@sensenet/repository-events'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Semaphore from 'semaphore-async-await'
import { useSelectionService } from '../../hooks'
import { ActionNameType } from '../react-control-mapper'
import { ItemType, Tree } from './tree'

type TreeWithDataProps = {
  onItemClick: (item: GenericContent) => void
  parentPath: string
  activeItemPath: string
  setFormOpen?: (actionName: ActionNameType) => void
  onTreeLoadingChange?: (isLoading: boolean) => void
}

let lastRequest: { path: string; lastIndex: number } | undefined

const ITEM_THRESHOLD = 50

const walkTree = (node: ItemType, callBack: (node: ItemType) => void) => {
  if (node.children?.length) {
    node.children.forEach((child) => {
      callBack(child)
      walkTree(child, callBack)
    })
  }
}
const lock = new Semaphore(1)

export default function TreeWithData(props: TreeWithDataProps) {
  const repo = useRepository()
  const [itemCount, setItemCount] = useState<number>()
  const [treeData, setTreeData] = useState<ItemType>()
  const [isLoading, setIsLoading] = useState(false)
  const selectionService = useSelectionService()
  const eventHub = useRepositoryEvents()
  const logger = useLogger('tree-with-data')
  const currentContent = useContext(CurrentContentContext)

  const loadCollection = useCallback(
    async (path: string, top: number, skip: number) => {
      const ac = new AbortController()
      props.onTreeLoadingChange && props.onTreeLoadingChange(true)
      setIsLoading(true)
      try {
        const result = await repo.loadCollection<GenericContent>({
          path,
          requestInit: {
            signal: ac.signal,
          },
          oDataOptions: {
            top,
            skip,
            filter: 'IsFolder eq true',
            orderby: [
              ['DisplayName', 'asc'],
              ['Name', 'asc'],
            ],
          },
        })
        props.onTreeLoadingChange && props.onTreeLoadingChange(false)
        setIsLoading(false)
        return result
      } catch (error) {
        if (!ac.signal.aborted) {
          logger.warning({ message: `Couldn't load content for ${path}`, data: error })
        }
        props.onTreeLoadingChange && props.onTreeLoadingChange(false)
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logger, repo],
  )

  const loadRoot = useCallback(async () => {
    const root = await repo.load({ idOrPath: props.parentPath })
    const result = await loadCollection(props.parentPath, ITEM_THRESHOLD, 0)

    if (!result) {
      logger.debug({ message: `loadCollection failed to load from ${props.parentPath}` })
      return
    }
    setItemCount(result.d.__count)
    setTreeData({
      ...root.d,
      children: result.d.results,
      hasNextPage: result.d.__count > result.d.results.length,
      expanded: true,
    })
  }, [loadCollection, logger, props.parentPath, repo])

  const loadMoreItems = useCallback(
    async (startIndex: number, path = props.parentPath) => {
      // Do not load duplicate request
      if (lastRequest?.lastIndex === startIndex && lastRequest.path === path) {
        return
      }
      lastRequest = { lastIndex: startIndex, path }
      const result = await loadCollection(path, ITEM_THRESHOLD, startIndex)

      if (!result) {
        logger.debug({ message: `loadCollection failed to load from ${props.parentPath}` })
        return
      }

      // load more items under root
      if (path === props.parentPath) {
        setTreeData((prevItem) => {
          if (prevItem && prevItem.children) {
            return {
              ...prevItem,
              children: [...prevItem.children, ...result.d.results],
              hasNextPage: result.d.__count > result.d.results.length,
            }
          }
        })
      } else {
        // load more items under tree node
        walkTree(treeData!, (node) => {
          if (node.Path === path && node.children) {
            node.children = [...node.children, ...result.d.results]
            node.hasNextPage = result.d.__count > node.children.length
          }
        })
        setTreeData({ ...treeData! })
      }
    },
    [loadCollection, logger, props.parentPath, treeData],
  )

  useEffect(() => {
    const handleCreate = (c: Created) => {
      // we need to reset the lastRequest object so we can make the same request again to get updated data
      lastRequest = undefined
      if ((c.content as GenericContent).ParentId === treeData?.Id) {
        loadRoot()
      } else {
        walkTree(treeData!, async (node) => {
          if ((c.content as GenericContent).ParentId === node.Id) {
            const result = await loadCollection(node.Path, ITEM_THRESHOLD, 0)
            if (!result) {
              logger.debug({ message: `loadCollection failed to load from ${node.Path}` })
              return
            }
            node.children = result.d.results
            node.hasNextPage = result.d.__count > node.children.length
            setTreeData({ ...treeData! })
          }
        })
      }
    }

    const subscriptions = [
      eventHub.onContentCreated.subscribe(handleCreate),
      eventHub.onContentCopied.subscribe(handleCreate),
      eventHub.onContentMoved.subscribe(handleCreate),
      eventHub.onContentModified.subscribe(handleCreate),
      eventHub.onContentDeleted.subscribe(async (d) => {
        await lock.acquire()
        walkTree(treeData!, (node) => {
          if (node.Id === d.contentData.Id && treeData?.children?.length) {
            treeData.children = treeData.children.filter((n) => n.Id !== d.contentData.Id)
            setItemCount((itemCountTemp) => itemCountTemp && itemCountTemp - 1)
          } else if (PathHelper.trimSlashes(node.Path) === PathHelper.getParentPath(d.contentData.Path)) {
            node.children = node.children?.filter((n) => n.Id !== d.contentData.Id)
            if (selectionService.activeContent.getValue()?.Id === d.contentData.Id) {
              selectionService.activeContent.setValue(node)
            }
          }
        })
        setTreeData({ ...treeData! })
        lock.release()
      }),
    ]

    return () => subscriptions.forEach((s) => s.dispose())
  }, [
    treeData,
    eventHub.onContentDeleted,
    selectionService.activeContent,
    eventHub.onContentCreated,
    eventHub.onContentCopied,
    eventHub.onContentMoved,
    eventHub.onContentModified,
    loadRoot,
    loadCollection,
    logger,
  ])

  useEffect(() => {
    const activeContent = selectionService.activeContent.getValue()
    if (activeContent?.Path !== props.activeItemPath) {
      selectionService.activeContent.setValue(currentContent)
    }
  }, [logger, props.activeItemPath, repo, selectionService.activeContent, currentContent])

  useEffect(() => {
    loadRoot()
  }, [loadRoot])

  const onItemClick = async (item: ItemType) => {
    if (!treeData) {
      return
    }

    walkTree(treeData, async (node: ItemType) => {
      if (node.Id === item.Id) {
        if (!node.expanded && !node.children?.length) {
          const children = await loadCollection(node.Path, ITEM_THRESHOLD, 0)
          if (children) {
            node.children = children.d.results
            node.hasNextPage = children.d.__count > node.children.length
          }
        }
        node.expanded = !node.expanded
        props.onItemClick(item)
        setTreeData({ ...treeData })
      }
    })
  }

  if (itemCount == null || !treeData) {
    return null
  }

  const setFormOpen = (actionName: ActionNameType) => {
    props.setFormOpen && props.setFormOpen(actionName)
  }

  return (
    <Tree
      itemCount={itemCount}
      treeData={treeData}
      loadMore={loadMoreItems}
      onItemClick={onItemClick}
      isLoading={isLoading}
      setFormOpen={(actionName) => setFormOpen(actionName)}
    />
  )
}
