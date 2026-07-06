import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function getPosts(req: Request, res: Response) {
  try {
    const { category, search, sort } = req.query;

    const where: any = {};

    if (category && category !== 'All Topics') {
      where.category = category as string;
    }

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { title: { contains: searchStr } },
        { content: { contains: searchStr } },
        { tags: { contains: searchStr } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' }; // default: most recent

    if (sort === 'Popular') {
      orderBy = { likes: 'desc' };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            mentorProfile: {
              select: {
                photo: true,
                designation: true,
                company: true,
              }
            }
          },
        },
        comments: {
          select: { id: true }
        }
      },
      orderBy,
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving discussion posts' });
  }
}

export async function getPostById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            mentorProfile: {
              select: {
                photo: true,
                designation: true,
                company: true,
              }
            }
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                mentorProfile: {
                  select: { photo: true, designation: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Discussion post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving post details' });
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const post = await prisma.post.create({
      data: {
        userId: req.user.id,
        title,
        content,
        category,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating discussion post' });
  }
}

export async function updatePost(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (req.user.role !== 'ADMIN' && post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own posts' });
    }

    const { title, content, category, tags } = req.body;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title || post.title,
        content: content || post.content,
        category: category || post.category,
        tags: tags !== undefined ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : post.tags,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating post' });
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Admins or post owners can delete posts
    if (req.user.role !== 'ADMIN' && post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot delete this post' });
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Post and its comments deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting post' });
  }
}

export async function addComment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        userId: req.user.id,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Notify post author (if comment is by someone else)
    if (post.userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          message: `${comment.user.name} commented on your post: "${post.title.substring(0, 30)}..."`,
          type: 'NEW_REPLY',
        },
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
}

export async function likePost(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { likes: post.likes + 1 },
    });

    res.json({ likes: updatedPost.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error liking post' });
  }
}
