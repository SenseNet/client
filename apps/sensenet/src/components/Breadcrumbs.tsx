import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { useSelectionService } from '../hooks'
import { ContentContextMenu } from './context-menu/content-context-menu'
import { DropFileArea } from './DropFileArea'
import { ActionNameType } from './react-control-mapper'

export interface BreadcrumbItem<T extends GenericContent> {
  url: string
  displayName: string
  title: string
  content: T
}

export interface BreadcrumbProps<T extends GenericContent> {
  items: Array<BreadcrumbItem<T>>
  onItemClick: (event: React.MouseEvent, item: BreadcrumbItem<T>) => void
  setFormOpen?: (actionName: ActionNameType) => void
}

/**
 * Represents a breadcrumb component
 */
function BreadcrumbsComponent<T extends GenericContent>(props: BreadcrumbProps<T> & RouteComponentProps) {
  const [contextMenuItem, setContextMenuItem] = useState<GenericContent | null>(null)
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false)
  const selectionService = useSelectionService()

  const setFormOpen = (actionName: ActionNameType) => {
    props.setFormOpen && props.setFormOpen(actionName)
  }

  return (
    <>
      <Breadcrumbs maxItems={5} aria-label="breadcrumb">
        {props.items.map((item) => (
          <DropFileArea key={item.content.Id} parentContent={item.content} style={{ display: 'inline-block' }}>
            <Tooltip title={item.title}>
              <Button
                onClick={(ev) => props.onItemClick(ev, item)}
                onContextMenu={(ev) => {
                  setContextMenuItem(item.content)
                  setContextMenuAnchor(ev.currentTarget)
                  setIsContextMenuOpened(true)
                  selectionService.activeContent.setValue(item.content)
                  ev.preventDefault()
                }}>
                <span style={{ textTransform: 'none', fontSize: '16px' }}>{item.displayName}</span>
              </Button>
            </Tooltip>
          </DropFileArea>
        ))}
      </Breadcrumbs>
      {contextMenuItem ? (
        <ContentContextMenu
          isOpened={isContextMenuOpened}
          content={contextMenuItem}
          menuProps={{
            anchorEl: contextMenuAnchor,
            BackdropProps: {
              onClick: () => setIsContextMenuOpened(false),
              onContextMenu: (ev) => ev.preventDefault(),
            },
          }}
          onClose={() => setIsContextMenuOpened(false)}
          halfPage={true}
          setFormOpen={(actionName) => setFormOpen(actionName)}
        />
      ) : null}
    </>
  )
}

const routed = withRouter(BreadcrumbsComponent)

export default routed
