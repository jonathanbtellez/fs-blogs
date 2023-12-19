const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const { notesInDb } = require('../../notas/tests/test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(note => new Blog(note))
  const promiseArray = blogObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

describe('validate properties of response', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/v1/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('identifier id is defined', async () => {
    const blogs = await helper.blogsInDb()
    blogs.map(blog => expect(blog.id).toBeDefined())
  })
})

describe('validate the body of the blog', () => {
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

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1)

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
    const blogsInDb = await helper.blogsInDb()
    const lastBlog = blogsInDb.pop()
    expect(lastBlog.likes).toBe(0)
  })

  test('fail with status code 404 if title invalid', async () => {
    const newBlog = {
      author: 'juna cat',
      url: 'url',
    }
    await api
      .post('/api/v1/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('fail with status code 404 if url invalid', async () => {
    const newBlog = {
      title: 'Blog 4',
      author: 'juna cat',
    }

    await api
      .post('/api/v1/blogs')
      .send(newBlog)
      .expect(400)
  })
})

describe('delrtion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/v1/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })
})
afterAll(() => {
  mongoose.connection.close()
})