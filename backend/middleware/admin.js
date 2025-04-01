const admin = (req, res, next) => {
  // Check if user exists and has admin privileges
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check for admin status using both isAdmin and role fields
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    console.log('User denied admin access:', req.user); // Debug log
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      user: {
        id: req.user._id,
        isAdmin: req.user.isAdmin,
        role: req.user.role
      }
    });
  }

  next();
};

module.exports = admin; 