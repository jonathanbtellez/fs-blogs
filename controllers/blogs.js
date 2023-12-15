const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    request.body.likes = request.body.likes ? request.body.likes : 0
    const blog = new Blog(request.body)
    const result = blog.save()
    response.status(201).json(result)
})

module.exports = blogsRouter
