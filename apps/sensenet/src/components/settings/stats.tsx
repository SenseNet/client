import { useRepository, VersionInfo } from '@sensenet/hooks-react'
import { Container } from '@material-ui/core'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useGlobalStyles } from '../../globalStyles'
import { useLocalization } from '../../hooks'
import { DashboardData } from '../dashboard/types'
import { FullScreenLoader } from '../full-screen-loader'
import { ComponentsWidget } from './stats-components-widget'
import { InstalledPackagesWidget } from './stats-installed-packages-widget'
import { StorageWidget } from './stats-storage-widget'

export const Stats: React.FunctionComponent = () => {
  const globalClasses = useGlobalStyles()
  const localization = useLocalization()
  const repository = useRepository()
  const [versionInfo, setVersionInfo] = useState<VersionInfo>()
  const [dashboardData, setDashboardData] = useState<DashboardData>()

  useEffect(() => {
    ;(async () => {
      const response = await repository.executeAction<any, VersionInfo>({
        idOrPath: '/Root',
        name: 'GetVersionInfo',
        method: 'GET',
      })

      setVersionInfo(response)
    })()
  }, [repository])

  useEffect(() => {
    ;(async () => {
      const response = await repository.executeAction<any, DashboardData>({
        idOrPath: '/Root',
        name: 'GetDashboardData',
        method: 'GET',
        oDataOptions: {
          select: ['Plan'],
        },
      })

      setDashboardData(response)
    })()
  }, [repository])

  if (!versionInfo || !dashboardData) return <FullScreenLoader />

  return (
    <div style={{ overflow: 'auto' }}>
      <div className={clsx(globalClasses.contentTitle, globalClasses.centeredVertical)} style={{ display: 'grid' }}>
        <span style={{ fontSize: '20px' }}>{localization.settings.stats}</span>
      </div>
      <Container fixed>
        <StorageWidget data={dashboardData} />
        <ComponentsWidget data={versionInfo} />
        <InstalledPackagesWidget data={versionInfo} />
      </Container>
    </div>
  )
}

export default Stats
