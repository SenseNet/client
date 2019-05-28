import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Add from '@material-ui/icons/Add'
import CloudUpload from '@material-ui/icons/CloudUpload'
import { GenericContent, Schema } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import { CurrentContentContext } from '../context'
import { useInjector, useLocalization, useLogger, useRepository } from '../hooks'
import { UploadTracker } from '../services/UploadTracker'
import { AddDialog } from './AddDialog'
import { Icon } from './Icon'

export interface AddButtonProps {
  parent?: GenericContent
}

export const AddButton: React.FunctionComponent<AddButtonProps> = props => {
  const injector = useInjector()
  const repo = useRepository()
  const parentContext = useContext(CurrentContentContext)
  const [parent, setParent] = useState(parentContext)
  const [showSelectType, setShowSelectType] = useState(false)
  const [allowedChildTypes, setAllowedChildTypes] = useState<Schema[]>([])

  const [showAddNewDialog, setShowAddNewDialog] = useState(false)
  const [selectedSchema, setSelectedSchema] = useState<Schema>(repo.schemas.getSchemaByName('GenericContent'))

  const localization = useLocalization().addButton
  const logger = useLogger('AddButton')

  useEffect(() => {
    props.parent && setParent(props.parent)
  }, [props.parent])

  useEffect(() => {
    !props.parent && setParent(parentContext)
  }, [parentContext])

  useEffect(() => {
    if (showSelectType) {
      repo
        .getAllowedChildTypes({ idOrPath: parent.Id })
        .then(types => setAllowedChildTypes(types.d.results.map(t => repo.schemas.getSchemaByName(t.Name))))
        .catch(error => {
          logger.error({
            message: localization.errorGettingAllowedContentTypes,
            data: {
              details: { error },
            },
          })
        })
    }
  }, [parent.Id, showSelectType])

  return (
    <div>
      <Tooltip title={localization.tooltip} placement="top-end">
        <Fab
          color="primary"
          style={{ position: 'fixed', bottom: '1em', right: '1em' }}
          onClick={() => setShowSelectType(true)}>
          <Add />
        </Fab>
      </Tooltip>
      <SwipeableDrawer
        anchor="bottom"
        onClose={() => setShowSelectType(false)}
        onOpen={() => {
          /** */
        }}
        open={showSelectType}>
        <Typography variant="subtitle1" style={{ margin: '0.8em' }}>
          {localization.new}
        </Typography>
        <div
          style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', maxHeight: '512px', overflow: 'auto' }}>
          <Button key="Upload">
            <label htmlFor="upload_file_input">
              <div
                style={{
                  width: 90,
                }}>
                <CloudUpload style={{ height: 38, width: 38 }} />
                <Typography variant="body1">{localization.upload}</Typography>
              </div>
            </label>
          </Button>
          <div style={{ visibility: 'hidden', display: 'none' }}>
            <input
              onChange={ev => {
                setShowSelectType(false)
                ev.target.files &&
                  repo.upload.fromFileList({
                    parentPath: parent.Path,
                    fileList: ev.target.files,
                    createFolders: true,
                    binaryPropertyName: 'Binary',
                    overwrite: false,
                    progressObservable: injector.getInstance(UploadTracker).onUploadProgress,
                  })
              }}
              type="file"
              accept=""
              multiple={true}
              id="upload_file_input"
            />
          </div>
          {allowedChildTypes.map(childType => (
            <Button
              key={childType.ContentTypeName}
              onClick={() => {
                setShowSelectType(false)
                setShowAddNewDialog(true)
                setSelectedSchema(childType)
              }}>
              <div
                style={{
                  width: 90,
                }}>
                <Icon style={{ height: 38, width: 38 }} item={childType} />
                <Typography variant="body1">{childType.DisplayName}</Typography>
              </div>
            </Button>
          ))}
        </div>
      </SwipeableDrawer>
      <AddDialog
        schema={selectedSchema}
        parent={parent}
        dialogProps={{
          open: showAddNewDialog,
          onClose: () => setShowAddNewDialog(false),
        }}
      />
    </div>
  )
}
