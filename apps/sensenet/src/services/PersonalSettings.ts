import { Injectable } from '@furystack/inject'
import { LogLevel } from '@furystack/logging'
import { deepMerge, ObservableValue } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { PlatformDependent } from '../context'
import { tuple } from '../utils/tuple'
import { BrowseType } from '../components/content'

const settingsKey = `SN-APP-USER-SETTINGS`

export interface UiSettings {
  theme: 'dark' | 'light'
  content: {
    browseType: typeof BrowseType[number]
    fields: Array<keyof GenericContent>
  }
  commandPalette: { enabled: boolean; wrapQuery: string }
  drawer: {
    enabled: boolean
    type: 'temporary' | 'permanent' | 'mini-variant'
    items: Array<DrawerItem<any>>
  }
}

export const widgetTypes = tuple('markdown', 'query', 'updates')
export interface Widget<T> {
  title: string
  widgetType: typeof widgetTypes[number]
  settings: T
  minWidth?: PlatformDependent<number | string>
}

export interface MarkdownWidget extends Widget<{ content: string }> {
  widgetType: 'markdown'
}

export interface UpdatesWidget extends Widget<undefined> {
  widgetType: 'updates'
}

export interface QueryWidget<T extends GenericContent>
  extends Widget<{
    columns: Array<keyof T>
    showColumnNames: boolean
    showRefresh?: boolean
    showOpenInSearch?: boolean
    enableSelection?: boolean
    top?: number
    query: string
    emptyPlaceholderText?: string
    countOnly?: boolean
  }> {
  widgetType: 'query'
}

export type WidgetSection = Array<MarkdownWidget | QueryWidget<GenericContent> | UpdatesWidget>

export const DrawerItemType = tuple(
  'Content',
  'Query',
  'Content Types',
  'Query',
  'Localization',
  'Search',
  'Setup',
  'Trash',
  'Version info',
  'Users and groups',
)

export interface DrawerItem<T> {
  /** */
  settings: T
  itemType: typeof DrawerItemType[number]
}

export interface ContentDrawerItem
  extends DrawerItem<{
    root: string
    title: string
    description?: string
    icon: string
    browseType: typeof BrowseType[number]
  }> {
  itemType: 'Content'
}

export interface QueryDrawerItem
  extends DrawerItem<{
    title: string
    description?: string
    icon: string
    term: string
    columns: Array<keyof GenericContent>
  }> {
  itemType: 'Query'
}

export interface BuiltinDrawerItem extends DrawerItem<undefined> {
  itemType:
    | 'Content Types'
    | 'Query'
    | 'Localization'
    | 'Search'
    | 'Setup'
    | 'Trash'
    | 'Version info'
    | 'Users and groups'
}

export type PersonalSettingsType = PlatformDependent<UiSettings> & {
  repositories: Array<{ url: string; loginName?: string; displayName?: string; dashboard?: WidgetSection }>
  lastRepository: string
  dashboards: {
    globalDefault: WidgetSection
    repositoryDefault: WidgetSection
  }
  eventLogSize: number
  sendLogWithCrashReports: boolean
  logLevel: Array<keyof typeof LogLevel>
  language: 'default' | 'hungarian'
}

export const defaultSettings: PersonalSettingsType = {
  dashboards: {
    globalDefault: [
      {
        title: 'Welcome back, {currentUserName}',
        widgetType: 'markdown',
        settings: {
          content: "It's a great day to do admin stuff!",
        },
      },
    ],
    repositoryDefault: [
      {
        title: 'Welcome back, {currentUserName}',
        widgetType: 'markdown',
        settings: {
          content: "It's a great day to do admin stuff!",
        },
        minWidth: {
          default: '100%',
        },
      },
      {
        title: 'Packages to update',
        widgetType: 'updates',
        minWidth: {
          default: '100%',
        },
        settings: undefined,
      },
      {
        title: 'Number of users',
        widgetType: 'query',
        minWidth: { default: '30%' },
        settings: {
          query: "+TypeIs:'User'",
          columns: [],
          countOnly: true,
          showColumnNames: false,
          showOpenInSearch: false,
          showRefresh: false,
        },
      },
      {
        title: 'Number of content items',
        widgetType: 'query',
        minWidth: { default: '30%' },
        settings: {
          query: "+TypeIs:'GenericContent'",
          columns: [],
          countOnly: true,
          showColumnNames: false,
        },
      },
      {
        title: 'Updates since yesterday',
        widgetType: 'query',
        minWidth: {
          default: '30%',
        },
        settings: {
          query: '+ModificationDate:>@@Yesterday@@',
          columns: [],
          countOnly: true,
          showColumnNames: false,
          showOpenInSearch: true,
        },
      },
      {
        title: 'Docs owned by me',
        widgetType: 'query',
        minWidth: {
          default: '100%',
        },
        settings: {
          query: "+(Owner:@@CurrentUser@@ AND TypeIs:'File')",
          columns: [],
          countOnly: true,
          showColumnNames: false,
          showOpenInSearch: true,
        },
      },
      {
        title: 'Docs shared with me',
        widgetType: 'query',
        minWidth: {
          default: '100%',
        },
        settings: {
          query: '+SharedWith:@@CurrentUser@@',
          columns: [],
          countOnly: true,
          showColumnNames: false,
          showOpenInSearch: true,
        },
      },
      {
        title: 'Tutorials',
        widgetType: 'markdown',
        settings: {
          content:
            '[Overview](https://index.hu) \n\n [Getting started](https://index.hu) \n\n [Tutorials](https://index.hu) \n\n [Example apps](https://index.hu) \n\n ',
        },
        minWidth: {
          default: '45%',
        },
      },
      {
        title: 'API documentation',
        widgetType: 'markdown',
        settings: {
          content:
            ' [Content Delivery API](https://index.hu) \n\n [Images API](https://index.hu) \n\n [Content management API](https://index.hu) \n\n [Content preview API](https://index.hu) \n\n',
        },
        minWidth: {
          default: '45%',
        },
      },
      {
        title: 'Have any questions?',
        widgetType: 'markdown',
        settings: {
          content:
            "<div style='text-align:center;'><a target='_blank' href='https://index.hu' style='text-decoration: none;'><button class='MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-contained'>Contact us</button></a></div>",
        },
        minWidth: {
          default: '100%',
        },
      },
    ],
  },
  default: {
    theme: 'dark',
    content: {
      browseType: 'explorer',
      fields: ['DisplayName', 'CreatedBy', 'Actions'],
    },
    drawer: {
      enabled: true,
      type: 'mini-variant',
      items: [
        { itemType: 'Search', settings: undefined },
        { itemType: 'Content', settings: { root: '/Root' } },
        { itemType: 'Users and groups', settings: undefined },
        { itemType: 'Content Types', settings: undefined },
        { itemType: 'Localization', settings: undefined },
        { itemType: 'Setup', settings: undefined },
        { itemType: 'Version info', settings: undefined },
      ],
    },
    commandPalette: { enabled: true, wrapQuery: '${0} .AUTOFILTERS:OFF' },
  },
  mobile: {
    drawer: {
      type: 'temporary',
    },
    content: {
      browseType: 'simple',
      fields: ['DisplayName'],
    },
  },
  repositories: [],
  lastRepository: '',
  language: 'default',
  eventLogSize: 500,
  sendLogWithCrashReports: true,
  logLevel: ['Information', 'Warning', 'Error', 'Fatal'],
}

@Injectable({ lifetime: 'singleton' })
export class PersonalSettings {
  constructor() {
    this.init()
  }

  private async init() {
    const currentUserSettings = await this.getLocalUserSettingsValue()
    this.userValue.setValue(currentUserSettings)
    this.effectiveValue.setValue(deepMerge(defaultSettings, currentUserSettings))
  }

  private async checkDrawerItems(settings: Partial<PersonalSettingsType>): Promise<Partial<PersonalSettingsType>> {
    if (
      settings.default &&
      settings.default.drawer &&
      settings.default.drawer.items &&
      settings.default.drawer.items.find(i => typeof i === 'string')
    ) {
      ;(settings.default.drawer.items as any) = undefined
    }

    if (
      settings.desktop &&
      settings.desktop.drawer &&
      settings.desktop.drawer.items &&
      settings.desktop.drawer.items.find(i => typeof i === 'string')
    ) {
      ;(settings.desktop.drawer.items as any) = undefined
    }

    if (
      settings.tablet &&
      settings.tablet.drawer &&
      settings.tablet.drawer.items &&
      settings.tablet.drawer.items.find(i => typeof i === 'string')
    ) {
      ;(settings.tablet.drawer.items as any) = undefined
    }

    if (
      settings.mobile &&
      settings.mobile.drawer &&
      settings.mobile.drawer.items &&
      settings.mobile.drawer.items.find(i => typeof i === 'string')
    ) {
      ;(settings.mobile.drawer.items as any) = undefined
    }

    return settings
  }

  private async checkValues(settings: Partial<PersonalSettingsType>): Promise<Partial<PersonalSettingsType>> {
    return await this.checkDrawerItems(settings)
  }

  public async getLocalUserSettingsValue(): Promise<Partial<PersonalSettingsType>> {
    try {
      const stored = JSON.parse((localStorage.getItem(`${settingsKey}`) as string) || '{}')
      return await this.checkValues(stored)
    } catch {
      /** */
    }
    return {}
  }

  public effectiveValue = new ObservableValue(defaultSettings)

  public userValue = new ObservableValue<Partial<PersonalSettingsType>>({})

  public async setPersonalSettingsValue(settings: Partial<PersonalSettingsType>) {
    this.userValue.setValue(settings)
    this.effectiveValue.setValue(deepMerge(defaultSettings, settings))
    localStorage.setItem(`${settingsKey}`, JSON.stringify(settings))
  }
}
