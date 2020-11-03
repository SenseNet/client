import { GenericContent, ReferenceFieldSetting } from '@sensenet/default-content-types'
import { Query, QueryExpression, QueryOperators } from '@sensenet/query'
import { ReferenceField } from '@sensenet/search-react'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { changeTemplatedValue } from '../helpers'
import { ReactClientFieldSetting } from '.'

/**
 * Represents an autocomplete component
 */
export const AutoComplete: React.FC<ReactClientFieldSetting<ReferenceFieldSetting>> = (props) => {
  const defaultValue =
    (props.fieldValue && (props.fieldValue as any)[0].Id) || changeTemplatedValue(props.settings.DefaultValue)
  const fetchItems = async (fetchQuery: Query<GenericContent>) => {
    try {
      if (!props.repository) {
        throw new Error('You must pass a repository to this control')
      }

      new QueryOperators(fetchQuery).and.query((q2) => {
        props.settings.AllowedTypes &&
          props.settings.AllowedTypes.forEach((allowedType, index, array) => {
            new QueryExpression(q2.queryRef).term(`TypeIs:${allowedType}`)
            if (index < array.length - 1) {
              return new QueryOperators(q2.queryRef).or
            }
          })
        return q2
      })

      new QueryOperators(fetchQuery).and.query((q2) => {
        props.settings.SelectionRoots &&
          props.settings.SelectionRoots.forEach((root, index, array) => {
            new QueryExpression(q2.queryRef).inTree(root)
            if (index < array.length - 1) {
              return new QueryOperators(q2.queryRef).or
            }
          })
        return q2
      })

      const result = await props.repository.loadCollection<GenericContent>({
        path: '/Root',
        oDataOptions: {
          query: fetchQuery.toString(),
          select: 'all',
        },
      })
      return result.d.results
    } catch (error) {
      console.error(error.message)
    }
  }

  switch (props.actionName) {
    case 'edit':
    case 'new':
      return (
        <ReferenceField
          fieldSetting={props.settings}
          fieldName={props.settings.Name as any}
          defaultValueIdOrPath={defaultValue}
          onChange={(item) => props.fieldOnChange?.(props.settings.Name, item)}
          fetchItems={fetchItems as any}
          triggerClear={props.triggerClear}
          autoFocus={props.autoFocus}
        />
      )
    case 'browse':
    default: {
      return (
        <div>
          <Typography variant="caption" gutterBottom={true}>
            {props.settings.DisplayName}
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            {props.fieldValue ? (props.fieldValue as any)[0].DisplayName : 'No value set'}
          </Typography>
        </div>
      )
    }
  }
}
