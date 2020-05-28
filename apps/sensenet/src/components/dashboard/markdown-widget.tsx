import { Typography } from '@material-ui/core'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useStringReplace } from '../../hooks'
import { MarkdownWidget as MarkdownWidgetModel } from '../../services/PersonalSettings'

export const MarkdownWidget: React.FunctionComponent<MarkdownWidgetModel> = (props) => {
  const replacedContent = useStringReplace(props.settings.content)
  const replacedTitle = useStringReplace(props.title)

  return (
    <>
      <Typography
        variant="h5"
        title={replacedTitle}
        gutterBottom={true}
        style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
        {replacedTitle}
      </Typography>
      <div style={{ overflow: 'auto' }}>
        <ReactMarkdown escapeHtml={false} source={replacedContent} />
      </div>
    </>
  )
}
