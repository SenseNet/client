import React from 'react'
import { GenericContent } from '@sensenet/default-content-types'
import {
  CurrentAncestorsProvider,
  CurrentChildrenProvider,
  CurrentContentProvider,
  LoadSettingsContextProvider,
} from '../../context'
import { useSelectionService } from '../../hooks'
import { AddButton } from '../AddButton'
import { CollectionComponent } from '../content-list'

export interface SimpleListComponentProps {
  parent: number | string
  onNavigate: (newParent: GenericContent) => void
  onActivateItem: (item: GenericContent) => void
  fieldsToDisplay?: Array<keyof GenericContent>
  rootPath?: string
}

export const SimpleList: React.FunctionComponent<SimpleListComponentProps> = props => {
  const selectionService = useSelectionService()

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <LoadSettingsContextProvider>
        <CurrentContentProvider idOrPath={props.parent}>
          <CurrentChildrenProvider>
            <CurrentAncestorsProvider root={props.rootPath}>
              <CollectionComponent
                enableBreadcrumbs={true}
                onActivateItem={props.onActivateItem}
                style={{ flexGrow: 1, flexShrink: 0, maxHeight: '100%', width: '100%' }}
                onParentChange={props.onNavigate}
                parentIdOrPath={props.parent}
                onTabRequest={() => {
                  /** */
                }}
                onSelectionChange={sel => {
                  selectionService.selection.setValue(sel)
                }}
                onActiveItemChange={item => selectionService.activeContent.setValue(item)}
                fieldsToDisplay={props.fieldsToDisplay}
              />
              <AddButton />
            </CurrentAncestorsProvider>
          </CurrentChildrenProvider>
        </CurrentContentProvider>
      </LoadSettingsContextProvider>
    </div>
  )
}
