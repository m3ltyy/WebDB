const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const isAuthenticated = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

// Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.render('register', { error: error.message });
  }
});

// Login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.render('error', { error: 'Не удалось выйти из системы' });
    }
    res.redirect('/');
  });
});

// Просмотр профиля
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('profile', { user });
  } catch (error) {
    res.render('error', { error: 'Не удалось загрузить профиль' });
  }
});

// Редактирование профиля
router.get('/profile/edit', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('editProfile', { user, error: null });
  } catch (error) {
    res.render('editProfile', { user: req.user, error: 'Не удалось загрузить данные для редактирования' });
  }
});

router.post('/profile/edit', isAuthenticated, async (req, res) => {
  try {
    const { username, email } = req.body;
    await User.findByIdAndUpdate(req.user._id, { username, email });
    res.redirect('/profile');
  } catch (error) {
    res.render('editProfile', { error: 'Не удалось обновить данные' });
  }
});

// Удаление профиля
router.post('/profile/delete', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout();
    res.redirect('/');
  } catch (error) {
    res.render('error', { error: 'Не удалось удалить профиль' });
  }
});

// Загрузка фотографии профиля
router.post('/profile/upload', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profilePicture = req.file.path; // Сохраняем URL изображения
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    res.render('profile', { user: req.user, error: 'Не удалось загрузить фотографию' });
  }
});

module.exports = router; 