import express from 'express';
import { authenticate, authorize, authorizeSuperAdmin, authorizeAdminOrSuperAdmin } from '../middleware/authenticate.js';
import rateLimiters from '../middleware/rateLimiter.js';
import {
  getStats,
  getAllUsers,
  verifyUser,
  deactivateUser,
  activateUser,
  getAllBookings,
  getAdminDashboard,
} from '../controllers/admin.controller.js';

const router = express.Router();

/**
 * Admin Routes
 * Platform administration and management
 * 
 * Access Hierarchy:
 * - Super Admin: Full access to all endpoints
 * - Admin: Access to monitoring and user management endpoints
 */

// All admin routes require authentication
router.use(authenticate);
router.use(rateLimiters.admin);

// ============================================
// ADMIN & SUPER ADMIN Routes (Both roles)
// ============================================

// Apply admin or super admin authorization to general endpoints
router.use('/', authorizeAdminOrSuperAdmin);

// GET /api/v1/admin/dashboard - Admin dashboard
router.get('/dashboard', getAdminDashboard);

// GET /api/v1/admin/stats - Platform statistics
router.get('/stats', getStats);

// GET /api/v1/admin/users - Get all users
router.get('/users', getAllUsers);

// PUT /api/v1/admin/users/:id/verify - Verify user
router.put('/users/:id/verify', verifyUser);

// PUT /api/v1/admin/users/:id/deactivate - Deactivate user
router.put('/users/:id/deactivate', deactivateUser);

// PUT /api/v1/admin/users/:id/activate - Reactivate user
router.put('/users/:id/activate', activateUser);

// GET /api/v1/admin/bookings - Get all bookings
router.get('/bookings', getAllBookings);

// ============================================
// SUPER ADMIN ONLY Routes
// ============================================

// System settings routes (Super Admin only)
router.post('/system/settings', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement system settings update
  res.json({
    message: 'Super Admin: System settings endpoint',
    status: 'pending',
  });
});

// Get system settings (Super Admin only)
router.get('/system/settings', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement system settings retrieval
  res.json({
    message: 'Super Admin: Get system settings endpoint',
    status: 'pending',
  });
});

// Create new admin (Super Admin only)
router.post('/create-admin', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement admin creation endpoint
  res.json({
    message: 'Super Admin: Create admin endpoint',
    status: 'pending',
  });
});

// List all admins (Super Admin only)
router.get('/admins', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement list admins endpoint
  res.json({
    message: 'Super Admin: List admins endpoint',
    status: 'pending',
  });
});

// Remove admin privileges (Super Admin only)
router.put('/admins/:id/remove', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement remove admin privileges endpoint
  res.json({
    message: 'Super Admin: Remove admin privileges endpoint',
    status: 'pending',
  });
});

// Delete user (Super Admin only)
router.delete('/users/:id', authorizeSuperAdmin, (req, res) => {
  // TODO: Implement user deletion endpoint
  res.json({
    message: 'Super Admin: Delete user endpoint',
    status: 'pending',
  });
});

export default router;
