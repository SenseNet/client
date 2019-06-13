import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { ODataParams } from '@sensenet/client-core'
import { PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { Created } from '@sensenet/repository-events'
import React, { useContext, useEffect, useState } from 'react'
import { CurrentAncestorsContext, CurrentContentContext } from '../../context'
import { useInjector, useRepository } from '../../hooks'
import { ContentContextMenu } from '../ContentContextMenu'
import { DropFileArea } from '../DropFileArea'
import { Icon } from '../Icon'

export interface TreeProps {
  parentPath: string
  onItemClick?: (item: GenericContent) => void
  activeItemId?: number
  loadOptions?: ODataParams<GenericContent>
  style?: React.CSSProperties
}

export const Tree: React.FunctionComponent<TreeProps> = props => {
  const [items, setItems] = useState<GenericContent[]>([])
  const ancestors = useContext(CurrentAncestorsContext)
  const [opened, setOpened] = useState<number[]>([])
  const [reloadToken, setReloadToken] = useState(0)
  const [ancestorPaths, setAncestorPaths] = useState(ancestors.map(a => a.Path))
  const injector = useInjector()
  const repo = useRepository()
  const eventHub = injector.getEventHub(repo.configuration.repositoryUrl)

  const [contextMenuItem, setContextMenuItem] = useState<GenericContent | null>(null)
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  const update = () => setReloadToken(Math.random())

  useEffect(() => {
    ancestors && ancestors.length && setAncestorPaths(ancestors.map(a => a.Path))
  }, [ancestors])

  useEffect(() => {
    const handleCreate = (c: Created) => {
      if (
        opened &&
        (c.content as GenericContent).IsFolder &&
        PathHelper.getParentPath(c.content.Path) === PathHelper.trimSlashes(props.parentPath)
      ) {
        update()
      }
    }

    const subscriptions = [
      eventHub.onContentCreated.subscribe(handleCreate),
      eventHub.onContentCopied.subscribe(handleCreate),
      eventHub.onContentMoved.subscribe(handleCreate),
      eventHub.onContentModified.subscribe(mod => {
        if (items.map(i => i.Id).includes(mod.content.Id)) {
          update()
        }
      }),
      eventHub.onContentDeleted.subscribe(d => {
        if (items.map(i => i.Id).includes(d.contentData.Id)) {
          update()
        }
      }),
    ]
    return () => subscriptions.forEach(s => s.dispose())
  }, [
    props.parentPath,
    repo,
    opened,
    items,
    eventHub.onContentCreated,
    eventHub.onContentCopied,
    eventHub.onContentMoved,
    eventHub.onContentModified,
    eventHub.onContentDeleted,
  ])

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const children = await repo.loadCollection({
          path: props.parentPath,
          requestInit: {
            signal: ac.signal,
          },
          oDataOptions: {
            filter: 'IsFolder eq true',
            ...props.loadOptions,
          },
        })
        setItems(children.d.results)
      } catch (error) {
        if (!ac.signal.aborted) {
          setError(error)
        }
      }
    })()
    return () => ac.abort()
  }, [props.loadOptions, props.parentPath, reloadToken, repo])

  if (error) {
    throw error
  }

  return (
    <div style={props.style}>
      <List dense={true}>
        {items.map(content => {
          const isOpened = opened.includes(content.Id) || (ancestorPaths && ancestorPaths.includes(content.Path))
          return (
            <div key={content.Id}>
              <DropFileArea parent={content}>
                <ListItem
                  onContextMenu={ev => {
                    setContextMenuItem(content)
                    setContextMenuAnchor(ev.currentTarget)
                    setIsContextMenuOpened(true)
                    ev.preventDefault()
                  }}
                  button={true}
                  selected={props.activeItemId === content.Id}
                  onClick={() => {
                    props.onItemClick && props.onItemClick(content)
                    setOpened(
                      isOpened ? opened.filter(o => o !== content.Id) : Array.from(new Set([...opened, content.Id])),
                    )
                  }}>
                  <ListItemIcon>
                    <Icon item={content} />
                  </ListItemIcon>
                  <ListItemText style={{ padding: 0 }} inset={true} primary={content.DisplayName || content.Name} />
                </ListItem>
              </DropFileArea>
              <Collapse style={{ marginLeft: '1em' }} in={isOpened} timeout="auto" unmountOnExit={true}>
                {isOpened ? (
                  <Tree parentPath={content.Path} onItemClick={props.onItemClick} activeItemId={props.activeItemId} />
                ) : null}
              </Collapse>
            </div>
          )
        })}
      </List>
      {contextMenuItem ? (
        <CurrentContentContext.Provider value={contextMenuItem}>
          <ContentContextMenu
            isOpened={isContextMenuOpened}
            menuProps={{
              anchorEl: contextMenuAnchor,
              BackdropProps: {
                onClick: () => setIsContextMenuOpened(false),
                onContextMenu: ev => ev.preventDefault(),
              },
            }}
            onClose={() => setIsContextMenuOpened(false)}
          />
        </CurrentContentContext.Provider>
      ) : null}
    </div>
  )
}
