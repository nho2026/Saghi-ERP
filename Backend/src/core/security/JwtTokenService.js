import jwt from "jsonwebtoken";
import { createHmac } from "node:crypto";
import { env } from "../../config/environment.js";

export const signToken = (userId, remember = false) =>
  jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: remember ? "30d" : "8h",
  });
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
export const createPinLookup = (pin) =>
  createHmac("sha256", env.pinLookupSecret).update(pin).digest("hex");
