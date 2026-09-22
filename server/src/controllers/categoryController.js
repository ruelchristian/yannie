const prisma = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.', error: error.message });
  }
};

module.exports = {
  getCategories,
};
