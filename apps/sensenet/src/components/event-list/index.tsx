import { ILeveledLogEntry } from '@furystack/logging'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import KeyboardBackspace from '@material-ui/icons/KeyboardBackspace'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { useEventService, useLocalization, useTheme } from '../../hooks'
import { Icon } from '../Icon'
import { EventDetails } from './details'
import { Filter } from './filter'
import { FilterContextProvider } from './filter-context'
import { List } from './list'

const EventList: React.FunctionComponent<RouteComponentProps<{ eventGuid?: string }>> = props => {
  const theme = useTheme()
  const eventService = useEventService()
  const localization = useLocalization().eventList.details
  let currentEvent: ILeveledLogEntry<any> | undefined

  if (props.match.params.eventGuid) {
    currentEvent = eventService.values.getValue().find(ev => ev.data.guid === props.match.params.eventGuid)
  }

  const [events, setEvents] = useState<Array<ILeveledLogEntry<any>>>(eventService.values.getValue())

  useEffect(() => {
    const observable = eventService.values.subscribe(values => setEvents(values))
    return () => observable.dispose()
  }, [eventService.values])

  return (
    <FilterContextProvider>
      <div style={{ padding: '1em', height: '100%' }}>
        <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon
              item={currentEvent ? currentEvent : { Type: 'EventLog' }}
              style={{ fontSize: 32, marginRight: '.3em', color: theme.palette.text.primary }}
            />
            <Typography variant="h4">{currentEvent ? currentEvent.message : 'Event list'} </Typography>
          </div>
          {currentEvent ? (
            <Link to="/events">
              <Button style={{ textDecoration: 'none' }}>
                <KeyboardBackspace /> {localization.back}
              </Button>
            </Link>
          ) : (
            <Filter style={{ justifySelf: 'flex-end', marginRight: 15 }} />
          )}
        </div>
        {currentEvent ? (
          <EventDetails event={currentEvent} />
        ) : (
          <List style={{ height: 'calc(100% - 48px)', overflow: 'auto' }} values={events} />
        )}
      </div>
    </FilterContextProvider>
  )
}

export default withRouter(EventList)
