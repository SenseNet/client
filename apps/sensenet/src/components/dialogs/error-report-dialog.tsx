import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Clear from '@material-ui/icons/Clear'
import SendTwoTone from '@material-ui/icons/SendTwoTone'
import { sleepAsync } from '@sensenet/client-utils'
import React, { useEffect, useState } from 'react'
import { useEventService, useLocalization, usePersonalSettings } from '../../hooks'

export type ErrorReportProps = { dismiss?: () => void; error: Error }

export const ErrorReport: React.FunctionComponent<ErrorReportProps> = props => {
  const localization = useLocalization().errorReport
  const personalSettings = usePersonalSettings()
  const evtService = useEventService()

  const [description, setDescription] = useState('')
  const [sendLog, setSendLog] = useState(personalSettings.sendLogWithCrashReports)

  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isSending) {
      ;(async () => {
        console.log(
          'TODO: Report sending endpoint',
          description,
          props.error,
          sendLog ? evtService.values.getValue() : null,
        )
        await sleepAsync(2500)
        props.dismiss && props.dismiss()
        window.location.replace('/')
      })()
    }
  }, [description, evtService.values, isSending, props, props.error, sendLog])

  return (
    <Dialog open={true} BackdropProps={{ style: { background: 'black' } }} fullWidth={true}>
      <DialogTitle>{localization.title}</DialogTitle>
      <DialogContent>
        {isSending ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress style={{ marginRight: '1em' }} />
            <Typography>{localization.sendingInProgress}</Typography>
          </div>
        ) : (
          <>
            <DialogContentText>
              <TextField
                fullWidth={true}
                multiline={true}
                label={localization.descriptionTitle}
                helperText={localization.descriptionHelperText}
                onChange={ev => setDescription(ev.target.value)}
              />
            </DialogContentText>
            <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={personalSettings.sendLogWithCrashReports}
                    onChange={ev => setSendLog(ev.target.checked)}
                  />
                }
                label={localization.allowLogSending}
              />
              <div>
                <Button onClick={() => props.dismiss && props.dismiss()}>
                  <Clear />
                  {localization.cancel}
                </Button>

                <Button
                  onClick={() => {
                    setIsSending(true)
                  }}>
                  <SendTwoTone />
                  {localization.send}
                </Button>
              </div>
            </DialogActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ErrorReport
