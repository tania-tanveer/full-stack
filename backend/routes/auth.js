const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('../database');
const { authenticateToken, generateToken } = require('../middleware/auth');

const RESET_TOKEN_EXPIRY_MINUTES = 30;

// Register new user
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Insert user
            db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    const user = { id: this.lastID, name, email };
                    const token = generateToken(user);

                    res.json({
                        message: 'Registration successful',
                        user,
                        token
                    });
                }
            );
        });
    });
});

// Login user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = generateToken(user);

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token
            });
        });
    });
});

// Request password reset
router.post('/forgot-password', (req, res) => {
    const email = req.body?.email?.trim().toLowerCase();

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Forgot password lookup error:', err.message);
            return res.json({
                message: 'If an account exists with this email, a reset link has been generated.'
            });
        }

        // Return generic response to avoid email enumeration
        if (!user) {
            return res.json({
                message: 'If an account exists with this email, a reset link has been generated.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

        db.run(
            'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?',
            [resetTokenHash, expiresAt, user.id],
            (updateErr) => {
                if (updateErr) {
                    console.error('Forgot password update error:', updateErr.message);
                    return res.json({
                        message: 'If an account exists with this email, a reset link has been generated.'
                    });
                }

                res.json({
                    message: 'If an account exists with this email, a reset link has been generated.',
                    resetToken,
                    resetUrl: `/reset-password?token=${resetToken}`
                });
            }
        );
    });
});

// Reset password using token
router.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    db.get(
        `SELECT id FROM users
         WHERE reset_token_hash = ?
         AND datetime(reset_token_expires_at) > datetime('now')`,
        [resetTokenHash],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(400).json({ error: 'Reset token is invalid or has expired' });
            }

            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    return res.status(500).json({ error: hashErr.message });
                }

                db.run(
                    `UPDATE users
                     SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
                     WHERE id = ?`,
                    [hashedPassword, user.id],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ error: updateErr.message });
                        }

                        res.json({ message: 'Password reset successful. You can now sign in.' });
                    }
                );
            });
        }
    );
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

module.exports = router;
