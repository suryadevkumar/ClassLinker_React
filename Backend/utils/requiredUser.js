export const requiredUser = (allowedRoles) => {
  return async (req, res, next) => {
    const userRole = req.session.userType;

    if (!userRole) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `${allowedRoles.join(' or ')} privileges required`
      });
    }

    next();
  };
};
