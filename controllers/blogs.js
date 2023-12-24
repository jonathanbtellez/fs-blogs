const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    if (!request.body.title) return response.status(400).end()
    if (!request.body.url) return response.status(400).end()
    
    const users = await User.find({})

    const blog = new Blog({
        title: request.body.title,
        url: request.body.url,
        author: request.body.author,
        likes: request.body.likes ? request.body.likes : 0,
        user: users[0]._id
    })

    const result = await blog.save()
    users[0].blogs = users[0].blogs.concat(result._id) 
    users[0].save()
    response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body
    const blog = {
        title,
        author,
        url,
        likes
    }

    console.log(blog)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter
