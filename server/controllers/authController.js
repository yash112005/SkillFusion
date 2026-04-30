const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

 const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.authProvider !== 'local') {
        return res.status(400).json({ message: `This email is already registered via ${userExists.authProvider}. Please sign in with ${userExists.authProvider}.` });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name, email, password, role, authProvider: 'local'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: `This email is registered via ${user.authProvider}. Please sign in with ${user.authProvider}.` });
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    
    console.log('Token received:', token);
    
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Google response status:', response.status);
    
    const payload = await response.json();
    console.log('Google payload:', payload);
  } catch (error) {
    console.error('Google login error:', error); // 👈 add karo
    res.status(401).json({ message: 'Google authentication failed' });
  }
}
const appleLogin = async (req, res) => {
  try {
    const { identityToken, userData, role } = req.body;
    
    const decodedToken = jwt.decode(identityToken);
    if (!decodedToken) {
      return res.status(400).json({ message: 'Invalid Apple token' });
    }

    const appleId = decodedToken.sub;
    const email = decodedToken.email;

    let name = 'Apple User';
    if (userData && userData.name) {
      name = `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim();
    }

    let user = await User.findOne({ appleId });

    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (user.authProvider !== 'apple') {
        user.appleId = appleId;
        user.authProvider = 'apple';
        await user.save();
      }
    } else {
      if (!email) {
        return res.status(400).json({ message: 'Email is required for sign up.' });
      }
      user = await User.create({
        name,
        email,
        appleId,
        authProvider: 'apple',
        role: role || 'candidate'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(401).json({ message: 'Apple authentication failed' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, googleLogin, appleLogin };