const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const initialBlogs = [
  {
    tile: 'Blog',
    author: 'juna cat',
    url: 'url',
    likes: 58
  },
  {
    tile: 'Blog 2',
    author: 'juna cat',
    url: 'url',
    likes: 58
  },
]
beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/v1/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('identifier  id is difined', async () => {
  const blogs = await Blog.find({})
  expect(blogs[0].id).toBeDefined() 
})

afterAll(() => {
  mongoose.connection.close()
})