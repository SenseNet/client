import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import { ConstantContent } from '@sensenet/client-core'
import { Settings } from '@sensenet/default-content-types'
import { useRepository } from '@sensenet/hooks-react'
import { Query } from '@sensenet/query'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { applicationPaths, resolvePathParams } from '../../application-paths'
import { useGlobalStyles } from '../../globalStyles'
import { useLocalization, useSelectionService } from '../../hooks'
import { useDialogActionService } from '../../hooks/use-dialogaction-service'
import { getPrimaryActionUrl } from '../../services/content-context-service'
import { ContentContextMenu } from '../context-menu/content-context-menu'
import { WellKnownContentCard } from './well-known-content-card'

const Setup = () => {
  const repo = useRepository()
  const localization = useLocalization().settings
  const globalClasses = useGlobalStyles()
  const localizationDrawerTitles = useLocalization().drawer.titles
  const [wellKnownSettings, setWellKnownSettings] = useState<Settings[]>([])
  const [settings, setSettings] = useState<Settings[]>([])
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false)
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [contextMenuItem, setContextMenuItem] = useState<Settings | null>(null)
  const dialogActionService = useDialogActionService()
  const selectionService = useSelectionService()
  const history = useHistory()

  useEffect(() => {
    const activeDialogActionObserve = dialogActionService.activeAction.subscribe((newDialogAction) => {
      if (selectionService.activeContent.getValue()) {
        switch (newDialogAction) {
          case 'edit':
            history.push(
              resolvePathParams({
                path: applicationPaths.editProperties,
                params: { contentId: selectionService.activeContent.getValue()!.Id },
              }),
            )
            break
          case 'browse':
            history.push(
              resolvePathParams({
                path: applicationPaths.browseProperties,
                params: { contentId: selectionService.activeContent.getValue()!.Id },
              }),
            )
            break
          case 'version':
            history.push(
              resolvePathParams({
                path: applicationPaths.versionProperties,
                params: { contentId: selectionService.activeContent.getValue()!.Id },
              }),
            )
            break
          default:
            break
        }
      }
    })

    return function cleanup() {
      activeDialogActionObserve.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogActionService.activeAction])

  useEffect(() => {
    ;(async () => {
      const response = await repo.loadCollection({
        path: ConstantContent.PORTAL_ROOT.Path,
        oDataOptions: {
          orderby: [['Index' as any, 'asc']],
          query: `${new Query((q) => q.typeIs(Settings)).toString()} .AUTOFILTERS:OFF`,
        },
      })

      setWellKnownSettings(
        response.d.results.filter((setting) => Object.keys(localization.descriptions).includes(setting.Path)),
      )

      setSettings(
        response.d.results.filter((setting) => !Object.keys(localization.descriptions).includes(setting.Path)),
      )
    })()
  }, [localization.descriptions, repo])

  return (
    <div className={globalClasses.contentWrapper}>
      <div className={clsx(globalClasses.contentTitle, globalClasses.centeredVertical)} style={{ display: 'grid' }}>
        <span style={{ fontSize: '20px' }}>{localizationDrawerTitles.Setup}</span>
      </div>
      {wellKnownSettings.length ? (
        <div className={globalClasses.centered} style={{ flexWrap: 'wrap' }}>
          <ContentContextMenu
            isOpened={isContextMenuOpened}
            content={contextMenuItem ?? wellKnownSettings[0]}
            onClose={() => setIsContextMenuOpened(false)}
            menuProps={{
              anchorEl: contextMenuAnchor,
              BackdropProps: {
                onClick: () => setIsContextMenuOpened(false),
                onContextMenu: (ev) => ev.preventDefault(),
              },
            }}
          />
          {wellKnownSettings.map((s) => (
            <WellKnownContentCard
              settings={s}
              key={s.Id}
              onContextMenu={(ev) => {
                ev.preventDefault()
                setContextMenuAnchor((ev.currentTarget as HTMLElement) || null)
                setContextMenuItem(s)
                selectionService.activeContent.setValue(s)
                setIsContextMenuOpened(true)
              }}
            />
          ))}
        </div>
      ) : null}
      <br />
      {settings && settings.length ? (
        <>
          <Typography variant="h5">{localization.otherSettings}</Typography>
          <List>
            {settings.map((s) => (
              <Link key={s.Id} to={getPrimaryActionUrl(s, repo)} style={{ textDecoration: 'none' }}>
                <ListItem button={true}>
                  <ListItemText primary={s.DisplayName || s.Name} secondary={s.Path} />
                </ListItem>
              </Link>
            ))}
          </List>
        </>
      ) : null}
    </div>
  )
}

export default Setup
