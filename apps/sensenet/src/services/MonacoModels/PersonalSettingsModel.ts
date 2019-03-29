import { Repository } from '@sensenet/client-core'
import { editor, languages, Uri } from 'monaco-editor'
import defaultLanguage from '../../localization/default'

export const setupModel = (language = defaultLanguage) => {
  const personalSettingsPath = `sensenet://settings/PersonalSettings`
  const uri = Uri.parse(personalSettingsPath)
  const uriString = uri.toString()

  languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    enableSchemaRequest: false,
    schemas: [
      {
        uri: uriString.toString(), // `sn-admin-personal-settings-${languageName}`,
        fileMatch: [uriString],
        schema: {
          definitions: {
            drawer: {
              type: 'object',
              description: 'Options for the left drawer',
              properties: {
                enabled: { type: 'boolean', description: 'Enable or disable the drawer' },
                type: { enum: ['temporary', 'permanent', 'mini-variant'] },
                items: {
                  description: 'An array of enabled items',
                  type: 'array',
                  uniqueItems: true,
                  items: { enum: ['Content', 'Search', 'Users and Groups', 'Setup', 'Version info'] },
                },
              },
            },
            repository: {
              type: 'object',
              required: ['url'],
              properties: {
                url: {
                  type: 'string',
                  description: 'The path of the repository, e.g.: https://my-sensenet-repository.org',
                },
                loginName: {
                  type: 'string',
                  description: "The last user you've logged in with",
                },
                displayName: {
                  type: 'string',
                  description: `An optional user friendly name to display the repository when you're connected to it`,
                },
              },
            },
            repositories: {
              type: 'array',
              items: { $ref: '#/definitions/repository' },
            },
            commandPalette: {
              type: 'object',
              description: 'Options for the command palette',
              properties: {
                enabled: { type: 'boolean', description: 'Enable or disable the command palette' },
                wrapQuery: {
                  type: 'string',
                  description: 'A wrapper for all queries executed from the command palette',
                },
              },
            },
            content: {
              type: 'object',
              description: 'Content browsing and basic editing functions',
              properties: {
                browseType: {
                  description:
                    'Choose between a simple list, a two-panel (commander) or a tree + single panel (explorer) style view',
                  enum: ['simple', 'commander', 'explorer'],
                },
                fields: {
                  description: 'Select fields to display',
                  type: 'array',
                  uniqueItems: true,
                  items: {
                    enum: [
                      'Actions',
                      'Type',
                      /** ToDo: check for other displayable system fields */
                      ...new Repository().schemas.getSchemaByName('GenericContent').FieldSettings.map(f => f.Name),
                    ],
                  },
                },
              },
            },
            settings: {
              type: 'object',
              description: 'One platform dependent setting object',
              properties: {
                theme: { enum: ['dark', 'light'], descriptions: language.personalSettings.themeTitle },
                content: { $ref: '#/definitions/content' },
                drawer: { $ref: '#/definitions/drawer' },
                commandPalette: { $ref: '#/definitions/commandPalette' },
              },
            },
          },
          type: 'object',
          required: ['default', 'repositories', 'lastRepository'],
          properties: {
            default: { $ref: '#/definitions/settings' },
            mobile: { $ref: '#/definitions/settings' },
            tablet: { $ref: '#/definitions/settings' },
            desktop: { $ref: '#/definitions/settings' },
            repositories: { $ref: '#/definitions/repositories' },
            lastRepository: { type: 'string', description: 'The last visited repository URL' },
            language: {
              description: language.personalSettings.languageTitle,
              enum: ['default', 'hungarian'],
            },
          },
        },
      },
    ],
  })
  const existingModel = editor.getModel(uri)
  if (!existingModel) {
    return editor.createModel('', 'json', Uri.parse(personalSettingsPath))
  }
}
