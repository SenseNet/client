import { ODataParams, Repository } from '@sensenet/client-core'
import { Folder, User } from '@sensenet/default-content-types'
import { useListPicker } from '@sensenet/pickers-react'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fade from '@material-ui/core/Fade'
import IconButton from '@material-ui/core/IconButton'
import InputLabel from '@material-ui/core/InputLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import React, { useEffect, useRef, useState } from 'react'

const UPLOAD = 'Upload'

const styles: { [index: string]: React.CSSProperties } = {
  uploadContainer: { minHeight: 50, position: 'relative' },
  loaderContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

interface AvatarPickerProps {
  change?: () => void
  select: (content: User) => void
  repository: Repository
  path: string
  renderIcon: (name: string) => JSX.Element
}

const pickerItemOptions: ODataParams<Folder> = {
  select: ['DisplayName', 'Path', 'Id', 'Children/IsFolder', 'IsFolder'] as any,
  expand: ['Children'] as any,
  filter: "(isOf('Folder') and not isOf('SystemFolder')) or isOf('Image')",
  metadata: 'no',
  orderby: [['IsFolder', 'desc'], 'DisplayName'],
}

/**
 * Represents an avatar picker component
 */
export const AvatarPicker: React.FC<AvatarPickerProps> = (props) => {
  const { items, selectedItem, setSelectedItem, path, navigateTo, reload, isLoading, error } = useListPicker<User>({
    repository: props.repository,
    currentPath: props.path,
    itemsODataOptions: pickerItemOptions,
  })
  const input = useRef<HTMLInputElement>(null)
  const [showLoading, setShowLoading] = useState(false)

  // Wait to show spinner to prevent content jumping
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoading(isLoading)
    }, 800)
    return () => {
      window.clearTimeout(timer)
    }
  }, [isLoading])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.change) {
      props.change()
    }
    e.persist()
    e.target.files &&
      (await props.repository.upload.fromFileList({
        fileList: e.target.files,
        createFolders: true,
        binaryPropertyName: 'Binary',
        overwrite: true,
        parentPath: path,
      }))
    reload()
  }

  const iconName = (node: User) => (node.IsFolder ? 'folder' : 'arrow_upward')

  const onClickHandler = (_e: React.MouseEvent, node: User) => {
    setSelectedItem(node)
    if (node.Type === 'Image') {
      props.select(node)
    }
  }

  if (showLoading) {
    return (
      <div style={styles.loaderContainer}>
        <Fade
          in={showLoading}
          style={{
            transitionDelay: showLoading ? '800ms' : '0ms',
          }}
          unmountOnExit={true}>
          <CircularProgress />
        </Fade>
      </div>
    )
  }

  if (error) {
    return <p>{error.message}</p>
  }

  return (
    <div>
      <List>
        {items &&
          items.map((node) => (
            <ListItem
              key={node.Id}
              onClick={(e) => onClickHandler(e, node)}
              onDoubleClick={() => navigateTo(node)}
              button={true}
              selected={selectedItem && node.Id === selectedItem.Id}>
              {node.IsFolder || node.IsFolder === undefined ? (
                <ListItemIcon>{props.renderIcon(iconName(node))}</ListItemIcon>
              ) : (
                <ListItemIcon>
                  <Avatar src={`${props.repository.configuration.repositoryUrl}${node.Path}`} />
                </ListItemIcon>
              )}
              <ListItemText primary={node.DisplayName} />
            </ListItem>
          ))}
      </List>
      <div style={styles.uploadContainer}>
        <input
          style={{ display: 'none' }}
          id="raised-button-file"
          ref={input}
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e)}
        />
        <InputLabel
          htmlFor="raised-button-file"
          onClick={() => input.current && input.current.click()}
          style={{ transform: 'translate(0, 58px) scale(1)', cursor: 'pointer' }}
          title={UPLOAD}>
          <IconButton>{props.renderIcon('add_circle')}</IconButton>
        </InputLabel>
      </div>
    </div>
  )
}
