// Google login: verify Google's ID token, then give the browser our own JWT in an httpOnly cookie.
import { Router } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "./models.js";

const router = Router();
const google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prod = process.env.NODE_ENV === "production";
// In production the frontend and backend are on different domains, so the cookie needs SameSite=None + Secure.
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? "none" : "lax" };

router.post("/google", async (req, res) => {
  try {
    const ticket = await google.verifyIdToken({ idToken: req.body.credential, audience: process.env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    const user = await User.findOneAndUpdate(
      { googleId: p.sub }, { name: p.name, email: p.email, avatar: p.picture }, { upsert: true, new: true });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { ...cookieOpts, maxAge: 7 * 24 * 3600 * 1000 }).json(user);
  } catch (e) {
    res.status(401).json({ error: "Google login failed" });
  }
});

// Middleware used by every protected route: reads the cookie and sets req.userId.
export function requireAuth(req, res, next) {
  try { req.userId = jwt.verify(req.cookies.token, process.env.JWT_SECRET).id; next(); }
  catch { res.status(401).json({ error: "Not logged in" }); }
}

router.get("/me", requireAuth, async (req, res) => res.json(await User.findById(req.userId)));
router.post("/logout", (req, res) => res.clearCookie("token", cookieOpts).json({ ok: true }));
export default router;
