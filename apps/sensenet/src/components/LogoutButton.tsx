import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew'
import { LoginState } from '@sensenet/client-core'
import React from 'react'
import { useSession } from '@sensenet/hooks-react'
import { useLocalization, useTheme } from '../hooks'
import { useDialog } from './dialogs'

export const LogoutButton: React.FunctionComponent<{
  buttonStyle?: React.CSSProperties
}> = props => {
  const session = useSession()
  const theme = useTheme()
  const localization = useLocalization().logout
  const { openDialog } = useDialog()

  const onClick = () => {
    openDialog({ name: 'logout', props: { userToLogout: session.currentUser } })
  }

  return (
    <div>
      {session.state !== LoginState.Authenticated ? null : (
        <Tooltip placement="bottom-end" title={localization.logoutButtonTitle}>
          <Button onClick={onClick} style={{ minWidth: 20, paddingTop: 4, paddingBottom: 4, borderRadius: 0 }}>
            <PowerSettingsNew style={{ ...props.buttonStyle, color: theme.palette.text.primary }} />
          </Button>
        </Tooltip>
      )}
    </div>
  )
}
