const successfulMethodByMinor = new Map([
  [0x01, "card"],
  [0x26, "fingerprint"],
  [0x4b, "face"],
  [0x65, "pin"],
]);

const canonicalMode = (value) => {
  const mode = String(value ?? "")
    .replaceAll(/[^a-z]/gi, "")
    .toLowerCase();
  if (["fp", "finger", "fingerprint"].includes(mode)) return "fingerprint";
  if (mode === "face") return "face";
  if (mode === "card") return "card";
  if (["pin", "pw", "password", "employeenoandpw"].includes(mode)) return "pin";
  return null;
};

export function verificationMethod(event) {
  const minorValue = event.minor ?? event.subEventType;
  const minor =
    typeof minorValue === "string" && /^0x/i.test(minorValue)
      ? Number.parseInt(minorValue, 16)
      : Number(minorValue);
  return (
    successfulMethodByMinor.get(minor) ??
    canonicalMode(
      event.actualVerifyMode ??
        event.authenticationMode ??
        event.verifyMode ??
        event.currentVerifyMode,
    )
  );
}

export function attendanceEventType(event) {
  const value = String(
    event.attendanceStatus ??
      event.eventType ??
      event.direction ??
      event.inOut ??
      "",
  )
    .replaceAll(/[^a-z]/gi, "")
    .toLowerCase();
  if (["checkout", "breakout", "overtimeout", "out", "exit"].includes(value))
    return "check_out";
  if (["checkin", "breakin", "overtimein", "in", "entry"].includes(value))
    return "check_in";
  return null;
}

export function verifiedAttendanceEvent(event) {
  const major = Number(event.major ?? event.majorEventType ?? 0);
  const eventType = attendanceEventType(event);
  const verification = verificationMethod(event);
  if (major !== 5 || !eventType || !verification) return null;
  return { eventType, verification };
}
