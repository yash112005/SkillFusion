const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');
const { forgotPasswordTemplate } = require('../utils/templateemail');

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

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Could not retrieve email from Google account' });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        authProvider: 'google',
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
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
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
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      // Check if email is changing and not taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
      }

      if (req.body.password && user.authProvider === 'local') {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider,
        subscriptionPlan: updatedUser.subscriptionPlan,
        usage_count: updatedUser.usage_count,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: `This account uses ${user.authProvider} login. Password reset is only available for local accounts.` });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken variable
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 mins)
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      { resetPasswordToken, resetPasswordExpire }
    );

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing Resend configuration');
      return res.status(500).json({ message: 'Server email configuration is missing' });
    }

    const { subject, html } = forgotPasswordTemplate(resetUrl);

    await sendEmail({
      to: user.email,
      subject,
      html
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Forgot password error details:', error);
    res.status(500).json({ 
      message: 'Email could not be sent', 
      error: error.message 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, googleLogin, appleLogin, forgotPassword, resetPassword };