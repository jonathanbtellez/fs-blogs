const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Blog 1',
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

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, usersInDb
}