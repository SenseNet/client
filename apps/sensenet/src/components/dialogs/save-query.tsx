import { useLogger, useRepository } from '@sensenet/hooks-react'
import { ODataResponse } from '@sensenet/client-core'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useState } from 'react'
import { Button, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core'
import { useLocalization } from '../../hooks'
import { useGlobalStyles } from '../../globalStyles'
import { useDialog } from './dialog-provider'

export type SaveQueryProps = {
  saveName?: string
  query: string
}

export function SaveQuery(props: SaveQueryProps) {
  const repo = useRepository()
  const localization = useLocalization().search
  const { closeLastDialog } = useDialog()
  const logger = useLogger('Search')
  const [saveName, setSaveName] = useState(props.saveName)
  const globalClasses = useGlobalStyles()

  const onClick = async () => {
    try {
      const result = await repo.executeAction<any, ODataResponse<GenericContent>>({
        idOrPath: '/Root/Content', //INFO(Zoli): This is hard coded for now. Wont work with repositories that do not have Root/Content.
        name: 'SaveQuery',
        method: 'POST',
        oDataOptions: {
          select: ['DisplayName', 'Query'],
        },
        body: {
          query: props.query,
          displayName: saveName,
          queryType: 'Public',
        },
      })
      logger.information({
        message: `Query '${result.d.DisplayName || result.d.Name}' saved`,
        data: { relatedContent: result.d, details: result },
      })
    } catch (error) {
      logger.warning({ message: error.message })
    } finally {
      closeLastDialog()
    }
  }

  return (
    <>
      <DialogTitle>{localization.saveQuery}</DialogTitle>
      <DialogContent style={{ minWidth: 450 }}>
        <TextField
          fullWidth={true}
          defaultValue={localization.saveInputPlaceholder(props.query)}
          onChange={(ev) => setSaveName(ev.currentTarget.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button className={globalClasses.cancelButton} onClick={closeLastDialog}>
          {localization.cancel}
        </Button>
        <Button color="primary" variant="contained" onClick={onClick}>
          {localization.save}
        </Button>
      </DialogActions>
    </>
  )
}

export default SaveQuery
