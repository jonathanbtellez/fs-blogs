const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const { userExtrator } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 }).populate('comments', { content: 1 })
    response.json(blogs)
})

blogsRouter.post('/', userExtrator, async (request, response) => {
    if (!request.body.title) return response.status(400).end()
    if (!request.body.url) return response.status(400).end()

    const user = request.user

    const blog = new Blog({
        title: request.body.title,
        url: request.body.url,
        author: request.body.author,
        likes: request.body.likes ? request.body.likes : 0,
        user: user._id
    })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    user.save()
    response.status(201).json(result)
})

blogsRouter.post('/:id/comment', userExtrator, async (request, response) => {
    const { content } = request.body

    const comment = new Comment({
        content,
        blog: request.params.id
    })

    const result = await comment.save()

    const blogToUpdate = await Blog.findById(request.params.id)

    console.log(result, blogToUpdate)

    blogToUpdate.comments = blogToUpdate.comments.concat(result._id)

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogToUpdate, { new: true }).populate('user', { username: 1, name: 1 }).populate('comments', { content: 1 })
    response.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtrator, async (request, response) => {
    const user = request.user

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).end()
    }

    if (!blog.user) {
        await Blog.deleteOne({ _id: blog._id })
        return response.status(204).end()
    }
    if (blog.user.toString() === user.id.toString()) {
        await Blog.deleteOne({ _id: blog._id })
        return response.status(204).end()
    }

    return response.status(403).json({ error: 'User do not have permision to delete this note' })

})

blogsRouter.get('/:id', userExtrator, async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 }).populate('comments', { content: 1 })
    response.json(blog)
})

blogsRouter.put('/:id', userExtrator, async (request, response) => {
    const { title, author, url, likes } = request.body

    const user = request.user

    console.log(request.body, request.user)

    const blog = {
        title,
        author,
        user: user.id,
        url,
        likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter
