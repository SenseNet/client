import { editor, languages, Uri } from 'monaco-editor'

const personalSettingsPath = 'sensenet://settings/PersonalSettings'

const uriString = Uri.parse(personalSettingsPath).toString()
languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  enableSchemaRequest: false,
  schemas: [
    {
      uri: 'sn-admin-personal-settings',
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
                description: 'The path for the repository, e.g.: https://my-sensenet-repository.org',
              },
              loginName: {
                type: 'string',
                description: "The last user you've logged in with",
              },
              displayName: {
                type: 'string',
                description: 'An optional user friendly name to display when referencing this repository',
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
            },
          },
          settings: {
            type: 'object',
            description: 'One platform dependent setting object',
            properties: {
              theme: { enum: ['dark', 'light'] },
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
        },
      },
    },
  ],
})

export const personalSettingsModel = editor.createModel('', 'json', Uri.parse(personalSettingsPath))
