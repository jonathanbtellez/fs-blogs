const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'Blog',
        author: 'juna cat',
        url: 'url',
        likes: 58
    },
    {
        title: 'Blog 2',
        author: 'juna cat',
        url: 'url',
        likes: 58
    },
]

const blogsInDb = async () => {
    const notes = await Blog.find({})
    return notes.map(note => note.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}