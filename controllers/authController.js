import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

export async function register(req, res) {
  try {
    const { name, lastname, email, password, confirmPassword, role, avatar } =
      req.body;

    if (!name || !lastname || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      lastname,
      email,
      password: hashedPassword,
      role: role || "user",
      avatar,
      isVerified: false,
    });

    await newUser.save();

    // Génération du token JWT pour vérification email (expire en 1 jour)
    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const verificationUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;

    await sendEmail({
      to: newUser.email,
      subject: "Vérifiez votre compte",
      html: `Bonjour ${name},<br><br>Merci de vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 24h.`,
    });

    res.status(201).json({
      message: "Utilisateur créé. Un email de vérification a été envoyé.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "Impossible d’enregistrer l'utilisateur." });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id)
      return res.status(400).json({ message: "Token invalide." });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable." });
    if (user.isVerified)
      return res.status(400).json({ message: "Compte déjà vérifié." });

    user.isVerified = true;
    await user.save();

    res.json({ message: "Compte vérifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Token invalide ou expiré." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Merci de vérifier votre email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      message: "Connexion réussie.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requis." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });

    // Création d'un token unique pour reset, par exemple un JWT ou token random
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Option 1: stocker un hash du token pour sécurité
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Sauvegarde dans la DB avec expiration 1h par ex
    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpire = Date.now() + 3600000; // 1h en ms
    await user.save();

    // URL de reset envoyée par email
    const resetUrl = `${CLIENT_URL}/api/auth/reset-password/${resetToken}`;

    await sendEmail({
      to: newUser.email,
      //to: "wazabi64000@gmail.com", // ← temporaire
      subject: "Réinitialisation de mot de passe",
      html: `<p>Bonjour,</p>
             <p>Pour réinitialiser votre mot de passe, cliquez sur ce lien :</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Ce lien expire dans 1 heure.</p>`,
    });

    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires." });

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas." });

  try {
    // Hash le token reçu pour le comparer en DB
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Trouver l'utilisateur avec token valide et non expiré
    const user = await User.findOne({
      resetPasswordToken: resetTokenHashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token invalide ou expiré." });

    // Hash du nouveau password
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}
