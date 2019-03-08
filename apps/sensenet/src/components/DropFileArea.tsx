import { Repository, Upload } from '@sensenet/client-core'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext, useState } from 'react'
import { UploadTracker } from '../services/UploadTracker'
import { InjectorContext } from './InjectorContext'
import { ThemeContext } from './ThemeContext'

export const DropFileArea: React.FunctionComponent<{ parent: GenericContent; style?: React.CSSProperties }> = props => {
  const [isDragOver, setDragOver] = useState(false)
  const injector = useContext(InjectorContext)
  const repo = injector.GetInstance(Repository)
  const theme = useContext(ThemeContext)

  return (
    <div
      style={{ position: 'relative', ...props.style }}
      onDragEnter={ev => {
        ev.stopPropagation()
        ev.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={ev => {
        ev.stopPropagation()
        ev.preventDefault()
        setDragOver(false)
      }}
      onDragOver={ev => {
        ev.stopPropagation()
        ev.preventDefault()
        setDragOver(true)
      }}
      onDrop={ev => {
        ev.stopPropagation()
        ev.preventDefault()
        setDragOver(false)
        Upload.fromDropEvent({
          binaryPropertyName: 'Binary',
          createFolders: true,
          event: new DragEvent('drop', { dataTransfer: ev.dataTransfer }),
          overwrite: false,
          parentPath: props.parent ? props.parent.Path : '',
          repository: repo,
          progressObservable: injector.GetInstance(UploadTracker).onUploadProgress,
        })
      }}>
      {isDragOver ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.primary.main,
            opacity: 0.1,
            position: 'absolute',
          }}
        />
      ) : null}
      {props.children}
    </div>
  )
}
