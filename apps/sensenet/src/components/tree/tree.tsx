/* eslint-disable import/named */
import { ListItem, ListItemIcon, ListItemText, List as MuiList } from '@material-ui/core'
import { GenericContent } from '@sensenet/default-content-types'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized'
import { useSelectionService } from '../../hooks'
import { ContentContextMenu } from '../context-menu/content-context-menu'
import { Icon } from '../Icon'

export type ItemType = GenericContent & {
  children?: ItemType[]
  expanded?: boolean
  hasNextPage?: boolean
}

type TreeProps = {
  itemCount: number
  isLoading: boolean
  loadMore: (startIndex: number, path?: string) => Promise<void>
  onItemClick: (item: GenericContent) => void
  treeData: ItemType
}

const ROW_HEIGHT = 48

export function Tree({ treeData, itemCount, onItemClick, loadMore, isLoading }: TreeProps) {
  const listRef = useRef<List>(null)
  const loader = useRef(loadMore)
  const selectionService = useSelectionService()
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [element, setElement] = useState<Element>()

  const observer = useRef(
    new IntersectionObserver(
      entries => {
        if (entries.length && entries.some(entry => entry.isIntersecting)) {
          const { path, startindex } = (entries[0].target as HTMLElement).dataset

          loader.current(parseInt(startindex ?? '0', 10), path)
        }
      },
      { threshold: 0 },
    ),
  )

  useEffect(() => {
    const currentObserver = observer.current
    if (element) {
      currentObserver.observe(element)
    }

    return () => {
      if (element) {
        currentObserver.unobserve(element)
      }
    }
  }, [element])

  useEffect(() => {
    listRef.current?.recomputeRowHeights()
    listRef.current?.forceUpdate()
  }, [treeData])

  useEffect(() => {
    loader.current = loadMore
  }, [loadMore])

  const rowHeight = ({ index }: Index) => {
    if (!treeData.children?.[index]) {
      return ROW_HEIGHT
    }
    return getExpandedItemCount(treeData.children[index]) * ROW_HEIGHT
  }

  const getExpandedItemCount = (item: ItemType) => {
    let totalCount = 1

    if (item.expanded && item.children) {
      totalCount += item.children.map(getExpandedItemCount).reduce((total, count) => {
        return total + count
      }, 0)
      if (item.hasNextPage) {
        totalCount++
      }
    }

    return totalCount
  }

  function renderItem(item: ItemType, keyPrefix: string, paddingLeft: number) {
    const onClick = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation()
      selectionService.activeContent.setValue(item)
      onItemClick(item)
      listRef.current?.recomputeRowHeights()
      listRef.current?.forceUpdate()
    }

    let children: ReactNode[] = []

    if (item.expanded && item.children) {
      children = item.children.map((child, index) => {
        return renderItem(child, `${keyPrefix}-${index}`, paddingLeft + 20)
      })
    }

    const nodeItem = (
      <ListItem
        onClick={onClick}
        onContextMenu={ev => {
          ev.preventDefault()
          selectionService.activeContent.setValue(item)
          setContextMenuAnchor(ev.currentTarget)
        }}
        selected={selectionService.activeContent.getValue()?.Id === item.Id}
        key={keyPrefix}
        style={{ paddingLeft }}
        button>
        <ListItemIcon>
          <Icon item={item} />
        </ListItemIcon>
        <ListItemText primary={item.DisplayName} />
      </ListItem>
    )

    if (item.hasNextPage && item.children && !isLoading) {
      const loadMoreEl = (
        <div className="loadMore" key="loadMore" data-startindex={item.children.length} data-path={item.Path} />
      )
      children.push(loadMoreEl)
    }
    children.unshift(nodeItem)

    return children
  }

  const rowRenderer = ({ key, style, index }: ListRowProps) => {
    if (!treeData.children?.[index]) {
      if (treeData.children) {
        return (
          <p
            style={style}
            key={index}
            className="loadMore"
            data-startindex={treeData.children.length}
            data-path={treeData.Path}>
            Loading
          </p>
        )
      }
      return (
        <p style={style} key={index}>
          Loading
        </p>
      )
    }
    return (
      <MuiList key={key} style={style}>
        {renderItem(treeData.children?.[index], index.toString(), 10)}
      </MuiList>
    )
  }

  return (
    <div
      style={{
        flexGrow: 2,
        flexShrink: 0,
        borderRight: '1px solid rgba(128,128,128,.2)',
      }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            height={height}
            overscanRowCount={10}
            ref={listRef}
            rowHeight={rowHeight}
            onRowsRendered={() => {
              const loadMoreElements = document.getElementsByClassName('loadMore')
              if (!loadMoreElements.length && !element) {
                return
              }
              setElement(loadMoreElements[0])
            }}
            rowRenderer={rowRenderer}
            rowCount={itemCount}
            width={width}
          />
        )}
      </AutoSizer>
      {selectionService.activeContent.getValue() ? (
        <ContentContextMenu
          isOpened={!!contextMenuAnchor}
          content={selectionService.activeContent.getValue()!}
          menuProps={{
            anchorEl: contextMenuAnchor,
            BackdropProps: {
              onClick: () => setContextMenuAnchor(null),
              onContextMenu: ev => ev.preventDefault(),
            },
          }}
          onClose={() => setContextMenuAnchor(null)}
        />
      ) : null}
    </div>
  )
}
