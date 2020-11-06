import { deepMerge, DeepPartial, ObservableValue } from '@sensenet/client-utils'
import React, { useCallback, useEffect, useState } from 'react'
import { ViewerState } from '../models/viewer-state'

export const defaultViewerState: ViewerState & {
  updateState: (newState: DeepPartial<ViewerState>) => void
} = {
  activePage: 1,
  zoomMode: 'custom',
  showWatermark: false,
  showRedaction: true,
  showShapes: true,
  showThumbnails: false,
  fitRelativeZoomLevel: 0,
  rotation: undefined,
  showComments: false,
  hasChanges: false,
  isPlacingCommentMarker: false,
  isCreateCommentActive: false,
  onPageChange: new ObservableValue(1),
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
