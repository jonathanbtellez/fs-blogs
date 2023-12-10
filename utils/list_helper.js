const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }
    const likes = blogs.map(blog => blog.likes)
    return blogs.length === 0
        ? 0
        : likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const blogsSorted = blogs.sort((a,b) => b.likes - a.likes)
    return blogsSorted[0]
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}