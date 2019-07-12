import { Injectable } from '@furystack/inject'
import { MetadataAction } from '@sensenet/client-core'
import { ObservableValue } from '@sensenet/client-utils'
import { ActionModel, GenericContent } from '@sensenet/default-content-types'
import { CommandProvider, SearchOptions } from '../CommandProviderManager'
import { LocalizationService } from '../LocalizationService'
import { SelectionService } from '../SelectionService'

@Injectable({ lifetime: 'singleton' })
export class CustomActionCommandProvider implements CommandProvider {
  public onExecuteAction = new ObservableValue<{
    content: GenericContent
    action: ActionModel
    metadata?: MetadataAction
    method: 'GET' | 'POST'
  }>()

  public onActionExecuted = new ObservableValue<{ content: GenericContent; action: ActionModel; response: any }>()

  public shouldExec(options: SearchOptions) {
    return this.selectionService.activeContent.getValue() && options.term.length > 2 && options.term.startsWith('>')
      ? true
      : false
  }
  public async getItems(options: SearchOptions) {
    const content = this.selectionService.activeContent.getValue()
    const localization = this.localization.currentValues.getValue().commandPalette.customAction
    const filteredTerm = options.term.substr(1).toLowerCase()
    if (!content) {
      return []
    }
    const result = await options.repository.load<GenericContent>({
      idOrPath: content.Id,
      oDataOptions: {
        metadata: 'full',
        expand: ['Actions'],
        select: ['Actions'],
      },
    })
    const actions = (result.d.Actions as ActionModel[]) || []

    return actions
      .filter(a => a.Name.toLowerCase().includes(filteredTerm) || a.DisplayName.toLowerCase().includes(filteredTerm))
      .map(a => {
        const actionMetadata =
          result.d.__metadata &&
          result.d.__metadata.actions &&
          result.d.__metadata.actions.find(action => action.name === a.Name)

        const functionMetadata =
          result.d.__metadata &&
          result.d.__metadata.functions &&
          result.d.__metadata.functions.find(fn => fn.name === a.Name)

        return {
          primaryText: localization.executePrimaryText
            .replace('{0}', content.DisplayName || content.Name)
            .replace('{1}', a.DisplayName || a.Name),
          secondaryText: localization.executeSecondaryText.replace('{0}', content.Name).replace('{1}', a.Name),
          content,
          hits: [filteredTerm],
          url: '',
          openAction: () =>
            this.onExecuteAction.setValue({
              action: a,
              content,
              metadata: actionMetadata || functionMetadata,
              method: actionMetadata ? 'POST' : 'GET',
            }),
        }
      })
  }

  constructor(
    private readonly selectionService: SelectionService,
    private readonly localization: LocalizationService,
  ) {}
}
