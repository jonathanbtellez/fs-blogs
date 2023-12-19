const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Blog 3',
    author: 'juna cat',
    url: 'url',
    likes: 58
  }

  await api
    .post('/api/v1/blogs')
    .send(newBlog)

  const blogsInDb = await Blog.find({})
  expect(blogsInDb).toHaveLength(initialBlogs.length + 1)

  const contents = blogsInDb.map(n => n.title)

  expect(contents).toContain(
    'Blog 3'
  )
})

test('If there are not likes the defaul value will be 0', async () => {
  const newBlog = {
    title: 'Blog 4',
    author: 'juna cat',
    url: 'url',
  }

  await api
    .post('/api/v1/blogs')
    .send(newBlog)
  const blogsInDb = await Blog.find({})
  const lastBlog = blogsInDb.pop()
  expect(lastBlog.likes).toBe(0)
})

test('Verify is includes title', async () => {
  const newBlog = {
    author: 'juna cat',
    url: 'url',
  }

  await api
    .post('/api/v1/blogs')
    .send(newBlog)
    .expect(400)
})

test('Verify is includes uri and title', async () => {
  const newBlog = {
    // title: 'Blog 4',
    author: 'juna cat',
  }

  await api
    .post('/api/v1/blogs')
    .send(newBlog)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})