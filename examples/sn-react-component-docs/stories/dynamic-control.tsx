import { Repository } from '@sensenet/client-core'
import { ActionName } from '@sensenet/control-mapper'
import { ReactClientFieldSetting, reactControlMapper } from '@sensenet/controls-react'
import { GenericContent } from '@sensenet/default-content-types'
import { boolean, number, object, text } from '@storybook/addon-knobs'
import React, { ComponentType, createElement } from 'react'

interface Options {
  actionName: ActionName
  repository: Repository
  token?: string
  content: GenericContent
  component?: ComponentType<ReactClientFieldSetting>
  fieldName: string
}

function getFieldValue({ actionName, content, component, fieldName }: Omit<Options, 'token'>) {
  if (actionName === 'new') {
    return undefined
  }

  if (component && component.displayName === 'Boolean') {
    return boolean('fieldValue', content[fieldName])
  }

  if (component && component.displayName === 'Number') {
    return number('fieldValue', content[fieldName])
  }

  if (typeof content[fieldName] === 'object' || Array.isArray(content[fieldName])) {
    return object('fieldValue', content[fieldName])
  }

  return text('fieldValue', content[fieldName])
}

export function DynamicControl({ actionName, repository, content, component, fieldName, token }: Options) {
  console.log(token)
  repository.configuration.token = token
  const schema = reactControlMapper(repository).getFullSchemaForContentType(content.Type, actionName)
  const fieldMapping = schema.fieldMappings.find((a) => a.fieldSettings.Name === fieldName)
  if (!fieldMapping) {
    return <p>{`${actionName} view is not available for this component!`}</p>
  }
  const componentToRender =
    component || reactControlMapper(repository).getControlForContentField(content.Type, fieldName, actionName)
  return createElement(componentToRender, {
    settings: object('settings', fieldMapping.fieldSettings),
    actionName,
    repository,
    content: actionName !== 'new' ? object('content', content) : undefined,
    fieldValue: getFieldValue({ actionName, content, component: componentToRender, fieldName, repository }),
  })
}
