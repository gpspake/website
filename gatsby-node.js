const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const moment = require('moment');

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  return graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create blog posts pages.
    const posts = result.data.allMarkdownRemark.edges

    posts.forEach((post, index) => {
      const previous = index === posts.length - 1 ? null : posts[index + 1].node
      const next = index === 0 ? null : posts[index - 1].node

      createPage({
        path: post.node.fields.slug,
        component: blogPost,
        context: {
          slug: post.node.fields.slug,
          previous,
          next,
        },
      })
    })

    return null
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    
    node.timestamp = +moment(node.frontmatter.date).format('X')
    node.collection = getNode(node.parent).sourceInstanceName;

    let slug = createFilePath({ node, getNode })
    let basePath = ``

    if (node.collection === "blog") {
      basePath = `/blog`
    }

    if (node.collection === "meetups") {
      basePath = `/meetups`
    }

    createNodeField({
      name: `slug`,
      node,
      value: `${basePath}${slug}`,
    })
  }
}

exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions

  createPage({
    ...page,
    context: {
      ...page.context,
      today: +moment().format('X'),
    },
  })
}
