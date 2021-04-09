import React from 'react'
import { render } from 'react-dom'
import { App } from './app'
import { AppProviders } from './components/app-providers'
import './style.css'

/**
 * Initialize React
 */
render(
  /** The RepositoryProvider will display a login form for non-authenticated users */
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root'),
)
