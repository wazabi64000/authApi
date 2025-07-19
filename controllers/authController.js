import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

export async function register(req, res) {
  try {
    const { name, lastname, email, password, confirmPassword, role, avatar } = req.body;

    if (!name || !lastname || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      lastname,
      email,
      password: hashedPassword,
      role: role || 'user',
      avatar,
      isVerified: false,
    });

    await newUser.save();

    // Générer token vérification email
    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    const verificationUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;

    await sendEmail({
      to: newUser.email,
      subject: 'Vérifiez votre compte',
      text: `Merci de vérifier votre compte en cliquant sur ce lien : ${verificationUrl}`,
    });

    res.status(201).json({ message: 'Compte créé. Vérifiez votre email pour activer le compte.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    if (!user.isVerified) return res.status(401).json({ message: 'Merci de vérifier votre email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Connexion réussie.', user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id) return res.status(400).json({ message: 'Token invalide.' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable.' });
    if (user.isVerified) return res.status(400).json({ message: 'Compte déjà vérifié.' });

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Compte vérifié avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Token invalide ou expiré.' });
  }
}
