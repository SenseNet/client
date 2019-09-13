import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'
import { debounce } from '@sensenet/client-utils'
import { useDocumentData, useLocalization, useViewerState } from '../../hooks'

/**
 * Document widget component for paging
 */
export const DocumentTitlePager: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false)

  const { documentData } = useDocumentData()
  const viewerState = useViewerState()
  const localization = useLocalization()

  const setPage = debounce((index: number) => {
    viewerState.updateState({ activePages: [index] })
    viewerState.onPageChange.setValue(index)
  }, 200)

  const [currentPage, setCurrentPage] = useState()

  const gotoPage = (page: string | number) => {
    let pageInt = typeof page === 'string' ? parseInt(page, 10) : page
    if (!isNaN(pageInt)) {
      pageInt = Math.max(pageInt, 1)
      pageInt = Math.min(pageInt, documentData.pageCount)
      setCurrentPage(pageInt)
    }
  }

  return (
    <ClickAwayListener onClickAway={() => setIsFocused(false)}>
      <Typography
        onClick={() => setIsFocused(true)}
        variant="h6"
        color="inherit"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', overflow: 'hidden', margin: '0 2.5em' }}
        title={documentData.documentName}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {documentData.documentName}&nbsp;
        </div>
        {isFocused ? (
          <form
            onSubmit={ev => {
              ev.preventDefault()
              setPage(currentPage)
            }}>
            <TextField
              style={{ flexShrink: 0 }}
              title={localization.gotoPage}
              value={currentPage}
              onChange={ev => gotoPage(ev.currentTarget.value)}
              type="number"
              required={true}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: 1,
                max: documentData.pageCount,
                style: { textAlign: 'center' },
              }}
              margin="dense"
            />
          </form>
        ) : (
          <div style={{ flexShrink: 0 }}>
            {viewerState.activePages[0]} / {documentData.pageCount}
          </div>
        )}
      </Typography>
    </ClickAwayListener>
  )
}
