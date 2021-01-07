import { storiesOf } from '@storybook/react'
import React from 'react'
import showCaseAppNotes from '../../notes/pickers/ConnectedToDms.md'
import { ExampleApp, ExampleAppWithHook } from './ExampleApp'

storiesOf('Picker', module)
  .add('Connected to repository', () => <ExampleApp />, { showCaseAppNotes })
  .add('Example app with hook', () => <ExampleAppWithHook />)
