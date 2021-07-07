import { InjectorContext, LoggerContextProvider } from '@sensenet/hooks-react'
import React, { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
  CurrentUserProvider,
  LocalizationProvider,
  PersonalSettingsContextProvider,
  RepositoryProvider,
  ResponsiveContextProvider,
  ThemeProvider,
} from '../context'
import {
  CommandProviderManager,
  CustomActionCommandProvider,
  HelpCommandProvider,
  NavigationCommandProvider,
  SearchCommandProvider,
} from '../services'
import { DialogProvider } from './dialogs/dialog-provider'
import { snInjector } from './sn-injector'

export type AppProvidersProps = {
  children: ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  snInjector
    .getInstance(CommandProviderManager)
    .RegisterProviders(
      CustomActionCommandProvider,
      HelpCommandProvider,
      NavigationCommandProvider,
      SearchCommandProvider,
    )
  return (
    <InjectorContext.Provider value={snInjector}>
      <LoggerContextProvider>
        <PersonalSettingsContextProvider>
          <LocalizationProvider>
            <BrowserRouter>
              <ThemeProvider>
                <RepositoryProvider>
                  <CurrentUserProvider>
                    <ResponsiveContextProvider>
                      <DialogProvider>{children}</DialogProvider>
                    </ResponsiveContextProvider>
                  </CurrentUserProvider>
                </RepositoryProvider>
              </ThemeProvider>
            </BrowserRouter>
          </LocalizationProvider>
        </PersonalSettingsContextProvider>
      </LoggerContextProvider>
    </InjectorContext.Provider>
  )
}
