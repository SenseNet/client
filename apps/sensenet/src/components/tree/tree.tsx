/* eslint-disable import/named */
import { GenericContent } from '@sensenet/default-content-types'
import { ListItem, ListItemIcon, ListItemText, List as MuiList } from '@material-ui/core'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized'
import { ContentContextMenu } from '../context-menu/content-context-menu'
import { Icon } from '../Icon'

export type ItemType = GenericContent & {
  children?: ItemType[]
  expanded?: boolean
  hasNextPage?: boolean
}

type TreeProps = {
  activeItemPath: string
  itemCount: number
  isLoading: boolean
  loadMore: (startIndex: number, path?: string) => Promise<void>
  onItemClick: (item: GenericContent) => void
  treeData: ItemType
}

const ROW_HEIGHT = 48
const LOAD_MORE_CLASS = 'loadMore'

export function Tree({ treeData, itemCount, onItemClick, loadMore, isLoading, activeItemPath }: TreeProps) {
  const listRef = useRef<List>(null)
  const loader = useRef(loadMore)
  const [activeContent, setActiveContent] = useState<GenericContent>()
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [elements, setElements] = useState<Element[]>()

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        if (entries.length && entries.some((entry) => entry.isIntersecting)) {
          const { path, startindex } = (entries[0].target as HTMLElement).dataset

          loader.current(parseInt(startindex ?? '0', 10), path)
        }
      },
      { threshold: 0 },
    ),
  )

  useEffect(() => {
    const currentObserver = observer.current
    elements?.forEach((element) => currentObserver.observe(element))

    return () => {
      elements?.forEach((element) => currentObserver.unobserve(element))
    }
  }, [elements])

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

    if (item.expanded && item.children?.length) {
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
        data-test={`${item.DisplayName}`}
        onContextMenu={(ev) => {
          ev.preventDefault()
          setContextMenuAnchor(ev.currentTarget)
          setActiveContent(item)
        }}
        selected={activeItemPath === item.Path}
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
        <div
          className={LOAD_MORE_CLASS}
          key={LOAD_MORE_CLASS}
          data-startindex={item.children.length}
          data-path={item.Path}
        />
      )
      children.push(loadMoreEl)
    }
    children.unshift(nodeItem)

    return children
  }

  const rowRenderer = ({ key, style, index }: ListRowProps) => {
    if (!treeData.children?.[index]) {
      return (
        <ListItem
          style={style}
          key={index}
          className={LOAD_MORE_CLASS}
          data-startindex={treeData.children?.length}
          data-path={treeData.Path}>
          <ListItemText primary="Loading" />
        </ListItem>
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
        minWidth: '350px',
        maxWidth: '400px',
        flexGrow: 2,
        flexShrink: 0,
        borderRight: '1px solid rgba(128,128,128,.2)',
      }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            overscanRowCount={10}
            ref={listRef}
            rowHeight={rowHeight}
            onRowsRendered={() => {
              const loadMoreElements = document.getElementsByClassName(LOAD_MORE_CLASS)
              if (!loadMoreElements.length && !elements) {
                return
              }
              setElements([...loadMoreElements])
            }}
            rowRenderer={rowRenderer}
            rowCount={itemCount}
            style={{ outline: 'none' }}
          />
        )}
      </AutoSizer>
      {activeContent ? (
        <ContentContextMenu
          isOpened={!!contextMenuAnchor}
          content={activeContent}
          menuProps={{
            anchorEl: contextMenuAnchor,
            BackdropProps: {
              onClick: () => setContextMenuAnchor(null),
              onContextMenu: (ev) => ev.preventDefault(),
            },
          }}
          onClose={() => setContextMenuAnchor(null)}
        />
      ) : null}
    </div>
  )
}
