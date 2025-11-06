const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validatePost, handleValidationErrors } = require('../middleware/validation');
const { dbQuery, dbRun, dbGet } = require('../database/db');

const router = express.Router();

router.use(authenticateToken);

// GET /api/data
router.get('/data', async (req, res) => {
  try {
    const posts = await dbQuery(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
    `);

    const sanitizedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.username
    }));

    res.json({
      status: 'success',
      data: {
        posts: sanitizedPosts,
        user: req.user
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch data'
    });
  }
});

// POST /api/posts
router.post('/posts', validatePost, handleValidationErrors, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const result = await dbRun(
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      [title, content, userId]
    );

    const newPost = await dbGet(
      'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [result.id]
    );

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: {
        post: {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          author: newPost.username
        }
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create post'
    });
  }
});

module.exports = router;