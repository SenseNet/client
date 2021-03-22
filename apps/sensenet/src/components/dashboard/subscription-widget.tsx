import { Button, createStyles, Grid, Link, makeStyles, Paper, Typography } from '@material-ui/core'
import React from 'react'
import logo from '../../assets/sensenet-icon-32.png'
import { useWidgetStyles } from '../../globalStyles'
import { useLocalization } from '../../hooks'
import { DashboardSubscription, DashboardVersion } from './types'
import { round } from '.'

const useStyles = makeStyles(() => {
  return createStyles({
    statusBox: {
      textAlign: 'center',
      alignSelf: 'center',
    },
    link: {
      marginTop: '2rem',
      textAlign: 'center',
    },
  })
})

interface SubscriptionWidgetProps {
  subscription: DashboardSubscription
  version: DashboardVersion
  isAdmin: boolean
}

export const SubscriptionWidget: React.FunctionComponent<SubscriptionWidgetProps> = (props) => {
  const classes = useStyles()
  const widgetClasses = useWidgetStyles()
  const localization = useLocalization().dashboard

  const { limitations } = props.subscription.plan
  const numberFormatter = new Intl.NumberFormat('en-US')

  return (
    <div className={widgetClasses.root}>
      <Typography variant="h2" gutterBottom={true} className={widgetClasses.title}>
        {localization.subscriptionPlan}
      </Typography>
      <Grid container justify="space-between" component={Paper} elevation={0} className={widgetClasses.container}>
        <Grid item xs={12} lg="auto" className={classes.statusBox}>
          <img src={logo} alt="logo" width="29" height="32" />
          <div className={widgetClasses.subtitle}>{props.subscription.plan.displayName}</div>
          {props.subscription.plan.baseprice !== undefined &&
            `(${
              props.subscription.plan.baseprice !== 0
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    props.subscription.plan.baseprice!,
                  )
                : localization.free
            })`}
        </Grid>
        <Grid item xs={12} lg="auto">
          <p className={widgetClasses.subtitle}>{localization.features}</p>
          <p data-test="feature-users">
            {numberFormatter.format(limitations.user)} {localization.users}
          </p>
          <p data-test="feature-content">
            {numberFormatter.format(limitations.content)} {localization.content}
          </p>
          <p style={{ marginBottom: 0 }} data-test="feature-storage-space">
            {numberFormatter.format(round(limitations.storage / 1024))} {localization.storageSpace}
          </p>
        </Grid>
        <Grid item xs={12} lg="auto">
          <p className={widgetClasses.subtitle}>{localization.version}</p>
          <p>{props.version.title}</p>
          <p>
            <Link href="https://sensenet.com/backend-updates" target="_blank" rel="noopener">
              {localization.releaseNotes}
            </Link>
          </p>
        </Grid>
        {props.isAdmin && (
          <Grid item xs={12} lg="auto">
            <p className={widgetClasses.subtitle}>{localization.getMore}</p>
            <div style={{ textAlign: 'center' }}>
              <Link href="https://profile.sensenet.com/" target="_blank" underline="none" rel="noopener">
                <Button color="primary" variant="contained">
                  {localization.upgrade}
                </Button>
              </Link>
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  )
}
