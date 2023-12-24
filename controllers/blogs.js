const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')



blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    if (!request.body.title) return response.status(400).end()
    if (!request.body.url) return response.status(400).end()

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

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

blogsRouter.delete('/:id', async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)
    console.log(blog)

    if(!blog){
        return response.status(404).end()
    }
    
    if ( blog.user.toString() === user._id.toString() ){
        await Blog.deleteOne({_id: blog._id})
        return response.status(204).end()
    }

    return response.status(403).json({ error: 'User do not have permision to delete this note' })

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
