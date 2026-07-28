const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

async function signup(req, res, next) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email,
      passwordHash: password, // pre-save hook hashes it
      name: name || '',
      role: role || 'student',
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}

module.exports = { signup, login, getMe };
