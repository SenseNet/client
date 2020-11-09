import { deepMerge, DeepPartial, ObservableValue } from '@sensenet/client-utils'
import React, { useCallback, useEffect, useState } from 'react'
import { ViewerState } from '../models/viewer-state'

export const DEFAULT_ZOOM_LEVEL = 3

export const defaultViewerState: ViewerState & {
  updateState: (newState: DeepPartial<ViewerState>) => void
} = {
  activePage: 1,
  showWatermark: false,
  showRedaction: true,
  showShapes: true,
  showThumbnails: false,
  zoomLevel: DEFAULT_ZOOM_LEVEL,
  rotation: undefined,
  showComments: false,
  hasChanges: false,
  isPlacingCommentMarker: false,
  isCreateCommentActive: false,
  onPageChange: new ObservableValue({ page: 1 }),
  updateState: () => {},
}
export const ViewerStateContext = React.createContext(defaultViewerState)

export const ViewerStateProvider: React.FC<{ options?: Partial<typeof defaultViewerState> }> = (props) => {
  const [state, setState] = useState<typeof defaultViewerState>(deepMerge({ ...defaultViewerState }, props.options))

  useEffect(() => {
    setState(deepMerge({ ...defaultViewerState }, props.options))
  }, [props.options])

  const updateState = useCallback(
    (newState: DeepPartial<typeof defaultViewerState>) => {
      setState(deepMerge({ ...state }, newState))
    },
    [state],
  )

  return <ViewerStateContext.Provider value={{ ...state, updateState }}>{props.children}</ViewerStateContext.Provider>
}
