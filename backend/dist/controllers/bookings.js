"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getBookings = getBookings;
exports.updateBookingStatus = updateBookingStatus;
exports.deleteBooking = deleteBooking;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createBooking(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { mentorId, date, time, duration, purpose, notes } = req.body;
        if (!mentorId || !date || !time || !duration || !purpose) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        // Verify mentor exists
        const mentor = await prisma.mentor.findUnique({
            where: { id: parseInt(mentorId) },
            include: { user: true }
        });
        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        const booking = await prisma.booking.create({
            data: {
                studentId: req.user.id,
                mentorId: mentor.id,
                date,
                time,
                duration,
                purpose,
                notes,
                status: 'PENDING',
            },
        });
        // Create a notification for the mentor user
        await prisma.notification.create({
            data: {
                userId: mentor.userId,
                message: `New mentorship request from ${req.user.email} (Student ID: ${req.user.id}) for ${date} at ${time}.`,
                type: 'BOOKING_REQUESTED',
            },
        });
        res.status(201).json(booking);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating booking request' });
    }
}
async function getBookings(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let bookings;
        if (req.user.role === 'STUDENT') {
            bookings = await prisma.booking.findMany({
                where: { studentId: req.user.id },
                include: {
                    mentor: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        else if (req.user.role === 'MENTOR') {
            // Find the mentor profile
            const mentor = await prisma.mentor.findUnique({
                where: { userId: req.user.id }
            });
            if (!mentor) {
                return res.status(404).json({ error: 'Mentor profile not found' });
            }
            bookings = await prisma.booking.findMany({
                where: { mentorId: mentor.id },
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        else if (req.user.role === 'ADMIN') {
            bookings = await prisma.booking.findMany({
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    },
                    mentor: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(bookings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error retrieving bookings' });
    }
}
async function updateBookingStatus(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid booking ID' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { status, date, time } = req.body;
        if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(status.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid or missing status' });
        }
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                mentor: { include: { user: true } },
                student: true
            }
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        // Verify permissions:
        // Mentors can change status (Accept/Reject/Reschedule). Students can change to CANCELLED. Admin can do any.
        if (req.user.role === 'MENTOR') {
            if (booking.mentor.userId !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden: You are not the assigned mentor' });
            }
        }
        else if (req.user.role === 'STUDENT') {
            if (booking.studentId !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden: You are not the booking student' });
            }
            if (status.toUpperCase() !== 'CANCELLED') {
                return res.status(403).json({ error: 'Forbidden: Students can only cancel bookings' });
            }
        }
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: status.toUpperCase(),
                date: date || booking.date,
                time: time || booking.time,
            },
        });
        // Notify student about status change
        let notificationMsg = `Your booking request with ${booking.mentor.user.name} has been ${status.toLowerCase()}.`;
        if (date || time) {
            notificationMsg = `Your booking request with ${booking.mentor.user.name} has been rescheduled to ${date || booking.date} at ${time || booking.time} (${status.toLowerCase()}).`;
        }
        await prisma.notification.create({
            data: {
                userId: booking.studentId,
                message: notificationMsg,
                type: status.toUpperCase() === 'ACCEPTED' ? 'BOOKING_ACCEPTED' : 'BOOKING_REJECTED',
            },
        });
        res.json(updatedBooking);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating booking status' });
    }
}
async function deleteBooking(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid booking ID' });
        }
        // Admin only
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Admin only' });
        }
        await prisma.booking.delete({ where: { id } });
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting booking' });
    }
}
