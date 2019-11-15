import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Drawer from '@material-ui/core/Drawer'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext } from 'react'
import { BrowseView } from '@sensenet/controls-react'
import { useRepository } from '@sensenet/hooks-react'
import { ResponsiveContext } from '../../context'
import { useLocalization } from '../../hooks'

export type ContentInfoDialogProps = {
  content: GenericContent
}

export const ContentInfoDialog: React.FunctionComponent<ContentInfoDialogProps> = props => {
  const device = useContext(ResponsiveContext)
  const localization = useLocalization().contentInfoDialog
  const repo = useRepository()

  //TODO: Check mobile view
  if (device === 'mobile') {
    return (
      <Drawer variant="temporary" anchor="bottom">
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '1em' }}>
          <BrowseView content={props.content} repository={repo} />
        </div>
      </Drawer>
    )
  }

  return (
    <>
      <DialogTitle>
        {localization.dialogTitle.replace('{0}', props.content.DisplayName || props.content.Name)}
      </DialogTitle>
      <DialogContent style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <BrowseView content={props.content} repository={repo} />
      </DialogContent>
    </>
  )
}

export default ContentInfoDialog
