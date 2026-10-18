export function errorHandler(error, _req, res, _next) {
  if (error.deviceConnection)
    console.warn(
      "Attendance device connection failed:",
      error.code,
      error.message,
    );
  else console.error(error);
  if (error.name === "ZodError")
    return res.status(400).json({
      message: error.issues?.[0]?.message ?? "Invalid request.",
      issues: error.issues,
    });
  if (error.code === "P2002")
    return res.status(409).json({
      message: "A record with that value already exists.",
      fields: error.meta?.target,
    });
  if (error.code === "P2003")
    return res.status(409).json({
      message:
        "This record is used by transaction history and cannot be permanently deleted.",
    });
  if (error.code === "P2025")
    return res.status(404).json({ message: "Record not found." });
  if (error.code === "PURCHASE_INSUFFICIENT_STOCK")
    return res
      .status(409)
      .json({
        message: error.message,
        code: error.code,
        details: error.details,
      });
  return res.status(error.status ?? 500).json({
    message:
      error.status || process.env.NODE_ENV !== "production"
        ? error.message
        : "Internal server error.",
  });
}
