require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
});
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.get("/admin/login", (req, res) => res.render("login"));
app.get("/admin/forgot-password", (req, res) => res.render("forgot-password"));
app.get("/admin/reset-password/:token", (req, res) => res.render("reset-password", { token: req.params.token }));
app.get("/admin/dashboard", (req, res) => res.render("dashboard"));

app.get("/admin*", (req, res) => res.redirect("/admin/login"));

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const User = require("./models/User");
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existing) {
      await User.create({
        name: process.env.ADMIN_NAME || "Geraldo Gama",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      console.log("Admin user created");
    }

    app.listen(PORT, () => {
      console.log(`Admin panel running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
