import CircularProgress from '@material-ui/core/CircularProgress'
import { Repository } from '@sensenet/client-core'
import { EditView } from '@sensenet/controls-react'
import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { ContentContextProvider } from '../../services/ContentContextProvider'
import { rootStateType } from '../../store'
import { loadContent } from '../../store/EditContent'
import Breadcrumbs, { BreadcrumbItem } from '../Breadcrumbs'
import { InjectorContext } from '../InjectorContext'

const mapStateToProps = (state: rootStateType) => ({
  content: state.editContent.currentContent,
  ancestors: state.editContent.ancestors,
  error: state.editContent.error,
})

export const mapDispatchToProps = {
  loadContent,
}

const GenericContentEditor: React.FunctionComponent<
  ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & RouteComponentProps<{ contentId?: string }>
> = props => {
  if (props.error) {
    throw props.error
  }
  const contentId = parseInt(props.match.params.contentId as string, 10)
  props.loadContent(contentId)

  const injector = useContext(InjectorContext)
  const repo = injector.GetInstance(Repository)

  return (
    <div style={{ width: '100%', height: '100%', padding: '1em', overflow: 'auto' }}>
      <Breadcrumbs
        onItemClick={(_ev, item) => {
          props.history.push(item.url)
        }}
        content={props.ancestors.map(
          content =>
            ({
              displayName: content.DisplayName || content.Name,
              title: content.Path,
              url: injector.GetInstance(ContentContextProvider).getPrimaryActionUrl(content),
              content,
            } as BreadcrumbItem),
        )}
        currentContent={{
          displayName: props.content.DisplayName || props.content.Name,
          title: props.content.Path,
          url: injector.GetInstance(ContentContextProvider).getPrimaryActionUrl(props.content),
          content: props.content,
        }}
      />
      {props.content.Id ? (
        <EditView
          content={props.content}
          repository={repo}
          contentTypeName={props.content.Type}
          onSubmit={async (id, content) => {
            repo.patch({
              idOrPath: id,
              content,
            })
          }}
        />
      ) : (
        <CircularProgress />
      )}
    </div>
  )
}

const connectedComponent = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(GenericContentEditor),
)

export default connectedComponent
