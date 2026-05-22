const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const auth = require("../middleware/auth");

const router = require("express").Router();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha obrigatórios." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }
    const token = signToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email obrigatório." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: "Email não encontrado." });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await PasswordReset.create({
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetLink = `${process.env.BASE_URL || "http://localhost:3000"}/admin/reset-password/${token}`;

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: user.email,
          from: process.env.SENDGRID_FROM || user.email,
          subject: "Redefinição de senha — Imobiliária Geraldo Gama",
          html: `<p>Olá ${user.name},</p>
<p>Recebemos uma solicitação para redefinir sua senha do painel admin.</p>
<p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#1f8a55;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Redefinir senha</a></p>
<p>Ou copie o link: ${resetLink}</p>
<p>Este link expira em 1 hora.</p>
<p>Se não foi você, ignore este email.</p>`,
        });
        console.log("Reset email sent to", user.email);
      } catch (err) {
        console.error("Failed to send email:", err.message);
      }
    } else {
      console.log("SendGrid not configured. Reset link:", resetLink);
    }

    res.json({ message: "Link de redefinição enviado para o email." });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres." });
    }
    const reset = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!reset) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }
    const user = await User.findOne({ email: reset.email });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    user.password = password;
    await user.save();
    reset.used = true;
    await reset.save();
    res.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Senha atual e nova senha obrigatórias." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Nova senha deve ter no mínimo 6 caracteres." });
    }
    const match = await req.user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }
    req.user.password = newPassword;
    await req.user.save();
    res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

module.exports = router;
