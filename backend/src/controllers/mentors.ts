import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function getMentors(req: Request, res: Response) {
  try {
    const { domain, experience, company, skills, search } = req.query;

    // Build filters dynamically
    const where: any = {};

    if (domain) {
      // support comma-separated domains or single domain
      const domains = (domain as string).split(',');
      where.domain = { in: domains };
    }

    if (company) {
      where.company = { contains: company as string, mode: 'insensitive' };
    }

    if (experience) {
      // e.g. experience=0-5 or experience=6-10 or experience=10+
      const expStr = experience as string;
      if (expStr === '0-5') {
        where.experience = { gte: 0, lte: 5 };
      } else if (expStr === '6-10') {
        where.experience = { gte: 6, lte: 10 };
      } else if (expStr === '10+') {
        where.experience = { gte: 11 };
      }
    }

    // Filter by skills (stored as JSON string, use contains for substring matching)
    if (skills) {
      const skillsList = (skills as string).split(',');
      where.OR = skillsList.map(skill => ({
        skills: { contains: skill, mode: 'insensitive' as const }
      }));
    }

    // Search query: search in name, company, designation, skills, domain
    if (search) {
      const searchStr = search as string;
      where.OR = [
        ...(where.OR || []),
        { user: { name: { contains: searchStr, mode: 'insensitive' as const } } },
        { company: { contains: searchStr, mode: 'insensitive' as const } },
        { designation: { contains: searchStr, mode: 'insensitive' as const } },
        { domain: { contains: searchStr, mode: 'insensitive' as const } },
        { skills: { contains: searchStr, mode: 'insensitive' as const } }
      ];
    }

    const mentors = await prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving mentors list' });
  }
}

export async function getMentorById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving mentor profile' });
  }
}

export async function updateMentor(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    // Check permissions: Logged in user must be this mentor or an Admin
    if (req.user.role !== 'ADMIN' && req.user.id !== mentor.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own profile' });
    }

    const { domain, company, designation, experience, bio, skills, languages, linkedin, photo, availability } = req.body;

    const updatedMentor = await prisma.mentor.update({
      where: { id },
      data: {
        domain: domain !== undefined ? domain : mentor.domain,
        company: company !== undefined ? company : mentor.company,
        designation: designation !== undefined ? designation : mentor.designation,
        experience: experience !== undefined ? parseInt(experience) : mentor.experience,
        bio: bio !== undefined ? bio : mentor.bio,
        skills: skills !== undefined ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : mentor.skills,
        languages: languages !== undefined ? (typeof languages === 'string' ? languages : JSON.stringify(languages)) : mentor.languages,
        linkedin: linkedin !== undefined ? linkedin : mentor.linkedin,
        photo: photo !== undefined ? photo : mentor.photo,
        availability: availability !== undefined ? (typeof availability === 'string' ? availability : JSON.stringify(availability)) : mentor.availability,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    res.json(updatedMentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating mentor profile' });
  }
}

export async function deleteMentor(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    // Only Admin can delete profiles
    await prisma.user.delete({ where: { id: mentor.userId } });

    res.json({ message: 'Mentor profile and associated user deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting mentor profile' });
  }
}
