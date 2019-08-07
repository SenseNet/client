import Dialog, { DialogProps } from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Drawer from '@material-ui/core/Drawer'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext } from 'react'
import { BrowseView } from '@sensenet/controls-react'
import { ResponsiveContext } from '../../context'
import { useLocalization, useRepository } from '../../hooks'

export const ContentInfoDialog: React.FunctionComponent<{
  dialogProps: DialogProps
  content: GenericContent
}> = props => {
  const device = useContext(ResponsiveContext)
  const localization = useLocalization().contentInfoDialog
  const repo = useRepository()

  if (device === 'mobile') {
    return (
      <Drawer variant="temporary" {...props.dialogProps} anchor="bottom">
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '1em' }}>
          <BrowseView content={props.content} repository={repo} />
        </div>
      </Drawer>
    )
  }

  return (
    <Dialog {...props.dialogProps}>
      <DialogTitle>
        {localization.dialogTitle.replace('{0}', props.content.DisplayName || props.content.Name)}
      </DialogTitle>
      <DialogContent style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <BrowseView content={props.content} repository={repo} />
      </DialogContent>
    </Dialog>
  )
}
