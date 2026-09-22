const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalReports,
      totalLost,
      totalFound,
      activeReports,
      resolvedReports,
      totalUsers,
      totalClaims,
      recentReports,
    ] = await Promise.all([
      prisma.itemReport.count(),
      prisma.itemReport.count({ where: { type: 'LOST' } }),
      prisma.itemReport.count({ where: { type: 'FOUND' } }),
      prisma.itemReport.count({ where: { status: 'ACTIVE' } }),
      prisma.itemReport.count({ where: { status: { in: ['CLAIMED', 'RETURNED', 'CLOSED'] } } }),
      prisma.user.count(),
      prisma.itemClaim.count(),
      prisma.itemReport.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          user: {
            select: { fullName: true, email: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        totalLost,
        totalFound,
        activeReports,
        resolvedReports,
        totalUsers,
        totalClaims,
      },
      recentReports,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            reports: true,
            claims: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['STUDENT', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        role: true,
      },
    });

    res.json({ success: true, message: `User role updated to ${role}.`, user: updated });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
