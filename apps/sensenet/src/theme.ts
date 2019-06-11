import { indigo, teal } from '@material-ui/core/colors'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import zIndex from '@material-ui/core/styles/zIndex'

const theme: ThemeOptions = {
  palette: {
    type: 'dark',
    primary: indigo,
    secondary: teal,
  },
  overrides: {
    MuiAppBar: {
      root: {
        zIndex: zIndex.drawer + 1,
      },
    },
    MuiTableCell: {
      root: {
        padding: '4px 56px 4px 24px',
      },
    },
  },
}

export default theme
