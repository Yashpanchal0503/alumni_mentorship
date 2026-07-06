"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const SECRET = JWT_SECRET;
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (!['STUDENT', 'MENTOR', 'ADMIN'].includes(role.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role.toUpperCase(),
            },
        });
        // If role is Mentor, create an empty Mentor profile
        if (user.role === 'MENTOR') {
            await prisma.mentor.create({
                data: {
                    userId: user.id,
                    domain: 'Technology', // Default domain
                    company: 'Add Company',
                    designation: 'Add Designation',
                    experience: 0,
                    bio: 'Click edit to fill in your bio.',
                    skills: JSON.stringify([]),
                    languages: JSON.stringify(['English']),
                    linkedin: '',
                    photo: '', // Default — frontend uses SVG avatar fallback
                    availability: JSON.stringify({ days: [], timeSlots: [] }),
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
            include: { mentorProfile: true },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                mentorProfile: user.mentorProfile,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
}
async function getProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                mentorProfile: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Omit password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error retrieving profile' });
    }
}
async function updateProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, photo } = req.body;
        // Note: 'role' is intentionally ignored — it is permanent and set at registration.
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { mentorProfile: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (photo !== undefined)
            updateData.photo = photo;
        // Sync photo to mentorProfile if it exists
        if (photo !== undefined && user.mentorProfile) {
            await prisma.mentor.update({
                where: { id: user.mentorProfile.id },
                data: { photo }
            });
        }
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            include: { mentorProfile: true }
        });
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
}
