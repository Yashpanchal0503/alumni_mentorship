"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getNotifications(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error retrieving notifications' });
    }
}
async function markAsRead(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid notification ID' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        if (notification.userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json(updatedNotification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating notification status' });
    }
}
async function markAllAsRead(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating notifications' });
    }
}
