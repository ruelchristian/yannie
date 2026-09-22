const prisma = require('../config/db');

const getItems = async (req, res) => {
  try {
    const {
      type,
      categoryId,
      status,
      search,
      userId,
      page = 1,
      limit = 24,
    } = req.query;

    const where = {};

    if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    if (categoryId && !isNaN(Number(categoryId))) {
      where.categoryId = Number(categoryId);
    }

    if (status) {
      if (status !== 'ALL') {
        where.status = status.toUpperCase();
      }
    } else {
      // Default to showing ACTIVE and CLAIMED items in the main feed
      where.status = {
        in: ['ACTIVE', 'CLAIMED', 'RETURNED', 'CLOSED'],
      };
    }

    if (userId && !isNaN(Number(userId))) {
      where.userId = Number(userId);
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { locationName: { contains: q } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.itemReport.findMany({
        where,
        include: {
          category: true,
          images: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { claims: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.itemReport.count({ where }),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('getItems error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve item reports.' });
  }
};

const getItemById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID.' });
    }

    const item = await prisma.itemReport.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phoneNumber: true,
          },
        },
        claims: {
          include: {
            claimant: {
              select: {
                id: true,
                fullName: true,
                email: true,
                studentId: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    // Only creator or admin can see full claims details; others see claim count
    const isOwnerOrAdmin = req.user && (req.user.id === item.userId || req.user.role === 'ADMIN');
    if (!isOwnerOrAdmin) {
      item.claims = undefined;
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('getItemById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve item details.' });
  }
};

const createItem = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      categoryId,
      locationName,
      latitude,
      longitude,
      dateIncident,
      contactInfo,
      imageUrls,
    } = req.body;

    if (!type || !title || !description || !categoryId || !locationName || !dateIncident) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: type, title, description, category, location, and date.',
      });
    }

    if (!['LOST', 'FOUND'].includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Item type must be either LOST or FOUND.' });
    }

    // Process files from multer and/or external image URLs
    const imagesToCreate = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagesToCreate.push({ imageUrl: `/uploads/${file.filename}` });
      });
    }

    if (imageUrls) {
      try {
        const parsedUrls = typeof imageUrls === 'string'
          ? (imageUrls.startsWith('[') ? JSON.parse(imageUrls) : imageUrls.split(',').map((u) => u.trim()))
          : imageUrls;
        const urlsArray = Array.isArray(parsedUrls) ? parsedUrls : [parsedUrls];
        urlsArray.forEach((url) => {
          if (typeof url === 'string' && url.trim().length > 0) {
            imagesToCreate.push({ imageUrl: url.trim() });
          }
        });
      } catch (err) {
        console.warn('Failed parsing imageUrls:', err);
      }
    }

    const item = await prisma.itemReport.create({
      data: {
        userId: req.user.id,
        categoryId: Number(categoryId),
        type: type.toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        locationName: locationName.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        dateIncident: new Date(dateIncident),
        contactInfo: contactInfo ? contactInfo.trim() : null,
        status: 'ACTIVE',
        images: {
          create: imagesToCreate,
        },
      },
      include: {
        category: true,
        images: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item report submitted successfully!',
      item,
    });
  } catch (error) {
    console.error('createItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to create item report.' });
  }
};

const updateItemStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID.' });
    }

    const validStatuses = ['ACTIVE', 'CLAIMED', 'RETURNED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await prisma.itemReport.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    // Only owner or admin can update status
    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this report.' });
    }

    const updated = await prisma.itemReport.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        images: true,
      },
    });

    res.json({
      success: true,
      message: `Report status updated to ${status}.`,
      item: updated,
    });
  } catch (error) {
    console.error('updateItemStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID.' });
    }

    const existing = await prisma.itemReport.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    // Only owner or admin can delete
    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this report.' });
    }

    await prisma.itemReport.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Item report successfully removed.',
    });
  } catch (error) {
    console.error('deleteItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item report.' });
  }
};

const submitClaim = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { proofDetails, contactNumber } = req.body;

    if (isNaN(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID.' });
    }

    if (!proofDetails || proofDetails.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide detailed proof of ownership or claim details (at least 5 characters).',
      });
    }

    const report = await prisma.itemReport.findUnique({ where: { id: reportId } });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    if (report.userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot submit a claim on your own report.' });
    }

    const claim = await prisma.itemClaim.create({
      data: {
        reportId,
        claimantId: req.user.id,
        proofDetails: proofDetails.trim(),
        contactNumber: contactNumber || req.user.phoneNumber || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Claim request submitted successfully! The reporter will review your details.',
      claim,
    });
  } catch (error) {
    console.error('submitClaim error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit claim request.' });
  }
};

const getMyReports = async (req, res) => {
  try {
    const [reports, claims] = await Promise.all([
      prisma.itemReport.findMany({
        where: { userId: req.user.id },
        include: {
          category: true,
          images: true,
          claims: {
            include: {
              claimant: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  studentId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.itemClaim.findMany({
        where: { claimantId: req.user.id },
        include: {
          report: {
            include: {
              category: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      reports,
      claims,
    });
  } catch (error) {
    console.error('getMyReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal reports.' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  submitClaim,
  getMyReports,
};
