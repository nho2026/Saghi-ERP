export const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

export const getTokenFromCookie = (req) => {
  const token = req.cookies?.token;
  if (!token) {
    return null;
  }
  return token;
};
