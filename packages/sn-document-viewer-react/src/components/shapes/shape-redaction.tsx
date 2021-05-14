import { Highlight, Shapes } from '@sensenet/client-core'
import { Button, ClickAwayListener, createStyles, makeStyles, Popper, Theme } from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalization, useViewerState } from '../../hooks'

type Props = {
  shape: Highlight
  onDragStart: (ev: React.DragEvent<HTMLElement>) => void
  onResized: (clientRect?: DOMRect) => void
  permissions: {
    canEdit: boolean
    canHideRedaction: boolean
    canHideWatermark: boolean
  }
  dimensions: {
    top: string | number | (string & {}) | undefined
    left: string | number | (string & {}) | undefined
    width: string | number | (string & {}) | undefined
    height: string | number | (string & {}) | undefined
  }
  zoomRatio: number
  removeShape: (shapeType: keyof Shapes, guid: string) => void
  rotationDegree: number
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      resize: ({ permissions, rotationDegree }) => (permissions.canEdit && rotationDegree === 0 ? 'both' : 'none'),
      overflow: 'auto',
      backgroundColor: 'black',
    },
    button: {
      backgroundColor: theme.palette.error.light,
    },
  }),
)

/**
 * Return a styled redaction component
 * @param shape Shape attributes
 * @param permissions Permissions of the current user
 * @param dimensions Shape dimensions
 * @param zoomRatio Zoom ratio
 * @param onDragStart Function triggered on drag event
 * @param onResized Function triggered on resized event
 * @param removeShape Function triggered on delete
 * @returns styled redaction component
 */
export function ShapeRedaction({
  shape,
  permissions,
  dimensions,
  zoomRatio,
  onDragStart,
  onResized,
  removeShape,
  rotationDegree,
}: Props) {
  const classes = useStyles({
    shape,
    permissions,
    dimensions,
    zoomRatio,
    onDragStart,
    onResized,
    removeShape,
    rotationDegree,
  })
  const localization = useLocalization()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'redaction-delete' : undefined
  const redactionElement = useRef<HTMLDivElement>(null)
  const viewerState = useViewerState()
  const { updateState } = viewerState

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (viewerState.currentlyResizedElementId === shape.guid) {
        updateState({ currentlyResizedElementId: undefined })
        onResized(redactionElement.current?.getClientRects()[0])
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [onResized, shape.guid, updateState, viewerState.currentlyResizedElementId])

  useEffect(() => {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          updateState({ currentlyResizedElementId: (mutation.target as any).id })
        }
      })
    })

    redactionElement.current && mutationObserver.observe(redactionElement.current, { attributes: true })
  }, [updateState])

  const onRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  return (
    <>
      <div
        id={shape.guid}
        className={classes.root}
        tabIndex={0}
        key={`r-${shape.h}-${shape.w}`}
        draggable={permissions.canEdit}
        onDragStart={onDragStart}
        onContextMenu={onRightClick}
        ref={redactionElement}
        style={{
          top: dimensions.top,
          left: dimensions.left,
          width: dimensions.width,
          height: dimensions.height,
        }}
      />
      <Popper id={id} open={open} anchorEl={anchorEl} placement="right-start">
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Button
            variant="contained"
            className={classes.button}
            onMouseUp={() => removeShape('redactions', shape.guid)}
            startIcon={<Delete scale={zoomRatio} />}>
            {localization.delete}
          </Button>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
