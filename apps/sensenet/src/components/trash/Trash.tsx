import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import { TrashBin } from '@sensenet/default-content-types'
import { useLoadContent } from '../../hooks/use-loadContent'
import { useDialog } from '../dialogs'
import { SimpleList } from '../content/Simple'
import TrashHeader from './TrashHeader'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(2), height: '92vh' },
    title: { display: 'flex', alignItems: 'center' },
    grow: { flexGrow: 1 },
  }),
)

const Trash = React.memo(() => {
  const { openDialog } = useDialog()
  const { content } = useLoadContent<TrashBin>({ idOrPath: '/Root/Trash', oDataOptions: { select: 'all' } })
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {content ? (
        <TrashHeader
          iconClickHandler={() =>
            openDialog({
              name: 'edit',
              props: { contentId: content.Id },
            })
          }
          trash={content}
        />
      ) : null}
      <SimpleList
        parent="/Root/Trash"
        collectionComponentProps={{
          enableBreadcrumbs: false,
          fieldsToDisplay: ['DisplayName', 'ModificationDate', 'ModifiedBy'],
        }}
      />
    </div>
  )
})

export default Trash
