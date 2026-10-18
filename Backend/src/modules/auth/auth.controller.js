import { withLoginLockout } from "./login-lockout.js";
import { env } from "../../config/environment.js";
import { authService } from "./auth.service.js";

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    if (error.retryAfter) res.set("Retry-After", String(error.retryAfter));
    next(error);
  }
};
export const authController = {
  login: handle(async (req, res) => {
    const { user, token, maxAge } = await withLoginLockout(
      req.validatedBody,
      req.ip ?? req.socket.remoteAddress ?? "unknown",
      (tx) => authService.login(req.validatedBody, tx),
    );
    req.auditUser = user;
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: env.production,
      sameSite: "lax",
      maxAge,
      path: "/",
    });
    res.json({ user });
  }),
  me: (req, res) => res.json({ user: authService.present(req.user) }),
  profile: handle(async (req, res) =>
    res.json({ user: await authService.profile(req.user.id) }),
  ),
  updateProfile: handle(async (req, res) =>
    res.json({
      user: await authService.updateProfile(req.user.id, req.validatedBody),
    }),
  ),
  profileEvents: handle(async (req, res) =>
    res.json(await authService.profileEvents(req.user.id, req.query)),
  ),
  logout: (_req, res) => {
    res.clearCookie("access_token", { path: "/" });
    res.status(204).end();
  },
};
