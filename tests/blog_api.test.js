const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)


const Blog = require('../models/blog')

let loggedInToken

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(note => new Blog(note))
  const promiseArray = blogObjects.map(note => note.save())
  await Promise.all(promiseArray)

  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('jannata', 10)
  const user = new User({
    username: 'camariana',
    passwordHash
  })
  await user.save()

  const response = await api
    .post('/api/v1/login')
    .send({
      username: 'camariana',
      password: 'jannata'
    })

  loggedInToken = response.body.token
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
      .set({ Authorization: `bearer ${loggedInToken}` })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


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
      .set({ Authorization: `bearer ${loggedInToken}` })
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
      .set({ Authorization: `bearer ${loggedInToken}` })
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
      .set({ Authorization: `bearer ${loggedInToken}` })
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/v1/blogs/${blogToDelete.id}`)
      .set({ Authorization: `bearer ${loggedInToken}` })
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })
})

describe('update a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogIdToUpdate = blogsAtStart[0]
    const blogToUpdate = {
      title: 'Blog three',
      author: 'juna cat',
      url: 'url',
      likes: blogIdToUpdate.likes + 1
    }
    const updatedBlog = await api
      .put(`/api/v1/blogs/${blogIdToUpdate.id}`).send(blogToUpdate)

    expect(updatedBlog._body.title).toBe(blogToUpdate.title)
    expect(updatedBlog._body.likes).toBe(blogToUpdate.likes)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/v1/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })


  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/v1/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})