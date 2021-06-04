import { Container, createStyles, Grid, makeStyles } from '@material-ui/core'
import { graphql, Link } from 'gatsby'
import * as React from 'react'
import BlogCard from '../components/blog-card'
import IndexLayout from '../layouts'
import { useGlobalStyles } from '../styles/globalStyles'

const useStyles = makeStyles(() => {
  return createStyles({
    blog: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    blogItem: {
      minHeight: '350px',
      overflow: 'hidden',
    },
    link: {
      textDecoration: 'inherit',
      height: '100%',
    },
    title: {
      textAlign: 'center',
      fontWeight: 500,
      marginBottom: '3rem',
      fontSize: '3.75rem',
      marginTop: 0,
    },
  })
})

export interface PostNode {
  node: {
    DisplayName: string
    Keywords: string
    Author: string
    PublishDate: Date
    leadImage: any
    fields: {
      slug: string
    }
    markdownLead: {
      childMdx: {
        body: any
      }
    }
  }
}
export interface IndexPageProps {
  data: {
    allSensenetBlogPost: {
      edges: PostNode[]
    }
  }
}

const IndexPage: React.FC<IndexPageProps> = (props) => {
  const { data } = props
  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <IndexLayout>
      <Container maxWidth="lg" className={globalClasses.container}>
        <h1 className={classes.title}>News around sensenet</h1>
        <Grid container spacing={4} className={classes.blog}>
          {data.allSensenetBlogPost.edges.map(({ node }, index) => (
            <Grid item xs={12} sm={6} md={4} className={classes.blogItem} key={index}>
              <Link to={node.fields.slug} key={index} className={classes.link}>
                <BlogCard title={node.DisplayName} excerpt={node.markdownLead.childMdx.body} image={node.leadImage} />
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </IndexLayout>
  )
}

export default IndexPage

export const query = graphql`
  query MyQuery {
    allSensenetBlogPost {
      edges {
        node {
          id
          Name
          DisplayName
          Keywords
          Author
          PublishDate
          leadImage {
            childImageSharp {
              gatsbyImageData(layout: FIXED)
            }
          }
          fields {
            slug
          }
          markdownLead {
            childMdx {
              body
            }
          }
        }
      }
    }
  }
`
