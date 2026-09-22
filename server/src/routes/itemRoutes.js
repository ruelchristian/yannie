const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  submitClaim,
  getMyReports,
} = require('../controllers/itemController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getItems);
router.get('/my', requireAuth, getMyReports);
router.get('/:id', optionalAuth, getItemById);
router.post('/', requireAuth, upload.array('images', 5), createItem);
router.patch('/:id/status', requireAuth, updateItemStatus);
router.post('/:id/claim', requireAuth, submitClaim);
router.delete('/:id', requireAuth, deleteItem);

module.exports = router;
