const Customer = require('../models/Customer');
const mongoose = require('mongoose');

/**
 * POST /api/admin/verify
 * Verify Admin Password
 */
exports.verifyAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      return res.json({
        success: true,
        message: 'Admin authorization successful!',
        adminKey: adminPassword
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin passcode.'
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during authentication check.' });
  }
};

/**
 * POST /api/customers
 * Save a new customer vehicle record (PUBLIC ACCESS)
 */
exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile, vehicleNumber, address } = req.body;

    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Customer Name must be at least 2 characters.');
    if (!mobile || !/^\+?[0-9\s\-]{10,15}$/.test(mobile.trim())) errors.push('Valid 10-15 digit Mobile Number is required.');
    if (!vehicleNumber || !/^[A-Za-z0-9\s\-]{4,15}$/.test(vehicleNumber.trim())) errors.push('Valid Vehicle Number is required.');
    if (!address || address.trim().length < 5) errors.push('Address must be at least 5 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const customer = new Customer({
      name: name.trim(),
      mobile: mobile.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      address: address.trim()
    });

    const savedCustomer = await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Customer record saved successfully!',
      data: savedCustomer
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Database Validation Error', errors: messages });
    }
    console.error('Error saving customer:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving customer record.', error: error.message });
  }
};

/**
 * GET /api/customers
 * List stored customer records (ADMIN ONLY)
 */
exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { mobile: searchRegex },
          { vehicleNumber: searchRegex },
          { address: searchRegex }
        ]
      };
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stored customer records.', error: error.message });
  }
};

/**
 * DELETE /api/customers/:id
 * Delete record by ID (ADMIN ONLY)
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Record ID' });
    }

    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.json({
      success: true,
      message: 'Customer record deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete customer record.', error: error.message });
  }
};
