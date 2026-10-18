import crypto from "node:crypto";
import { HikvisionClient } from "../hikvision/hikvision.client.js";
import { eventsModel as m } from "./events.model.js";
import { verifiedAttendanceEvent } from "./events.verification.js";
import { peopleService } from "../people/people.service.js";

let syncInProgress = false;

export const eventsService = {
  list(q) {
    const to = q.to ? String(q.to) : "";
    return m.list(
      {
        ...(q.deviceId && { deviceId: String(q.deviceId) }),
        ...(q.employeeNo && { employeeNo: { contains: String(q.employeeNo) } }),
        ...(q.eventType && { eventType: String(q.eventType) }),
        ...((q.from || q.to) && {
          occurredAt: {
            ...(q.from && {
              gte: new Date(
                String(q.from).length === 10
                  ? `${q.from}T00:00:00+03:00`
                  : String(q.from),
              ),
            }),
            ...(to && {
              lte: new Date(to.length === 10 ? `${to}T23:59:59.999+03:00` : to),
            }),
          },
        }),
      },
      q,
    );
  },
  async sync(input) {
    if (syncInProgress)
      throw Object.assign(new Error("An attendance sync is already running."), {
        status: 409,
      });
    syncInProgress = true;
    try {
      // Use the attendance site's Baghdad calendar month, independent of the
      // server timezone. Keep one cutoff for every device in this sync.
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Baghdad",
        year: "numeric",
        month: "2-digit",
      }).formatToParts(now);
      const year = parts.find((part) => part.type === "year").value;
      const month = parts.find((part) => part.type === "month").value;
      const parseBoundary = (value, end) => {
        const text = String(value);
        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
        if (
          dateOnly &&
          (Number.isNaN(Date.parse(text)) ||
            new Date(text).toISOString().slice(0, 10) !== text)
        )
          throw Object.assign(new Error("Invalid attendance date range."), {
            status: 400,
          });
        return new Date(
          dateOnly
            ? `${text}T${end ? "23:59:59.999" : "00:00:00"}+03:00`
            : text,
        );
      };
      const from = input.from
        ? parseBoundary(input.from, false)
        : new Date(`${year}-${month}-01T00:00:00+03:00`);
      const to = input.to ? parseBoundary(input.to, true) : now;
      if (
        !Number.isFinite(from.getTime()) ||
        !Number.isFinite(to.getTime()) ||
        from > to
      )
        throw Object.assign(new Error("Invalid attendance date range."), {
          status: 400,
        });
      const peopleResult = { synced: 0, errors: [] };
      const devices = await m.devices(input.deviceId);
      const results = await Promise.all(
        devices.map(async (d) => {
          let synced = 0;
          try {
            // Import only the requested range without modifying the terminal.
            const api = new HikvisionClient(d),
              people = new Map(
                (await m.people(d.id)).map((person) => [
                  person.employeeNo,
                  person,
                ]),
              );
            let peopleRefreshed = false;
            // Keep terminal searches within ten days, including for a full-month
            // sync. Each window needs its own search session and pagination.
            const windowSize = 10 * 24 * 60 * 60 * 1000;
            for (
              let start = from.getTime();
              start <= to.getTime();
              start += windowSize
            ) {
              const windowFrom = new Date(start);
              const windowTo = new Date(
                Math.min(start + windowSize - 1, to.getTime()),
              );
              const searchID = crypto.randomUUID().replaceAll("-", "");
              let position = 0;
              let complete = false;
              for (let page = 0; page < 5000; page++) {
                const info =
                    (await api.events(windowFrom, windowTo, position, searchID))
                      .AcsEvent ?? {},
                  list = info.InfoList ?? [];
                const eventId = (event, employeeNo, occurredAt) => {
                  const serial = event.serialNo ?? event.serialNumber;
                  return serial != null
                    ? String(serial)
                    : `${employeeNo}:${occurredAt.toISOString()}:${event.major ?? 0}:${event.minor ?? 0}`;
                };
                const candidates = list.filter((event) =>
                  Number.isFinite(new Date(event.time).getTime()),
                );
                const existing = new Map(
                  (
                    await m.existingEvents(
                      d.id,
                      candidates.map((event) =>
                        eventId(
                          event,
                          String(
                            event.employeeNoString ?? event.employeeNo ?? "",
                          ).trim(),
                          new Date(event.time),
                        ),
                      ),
                    )
                  ).map((event) => [event.deviceEventId, event]),
                );
                for (const event of list.sort(
                  (a, b) =>
                    new Date(a.time).getTime() - new Date(b.time).getTime(),
                )) {
                  const employeeNo = String(
                      event.employeeNoString ?? event.employeeNo ?? "",
                    ).trim(),
                    occurredAt = new Date(event.time),
                    attendance = verifiedAttendanceEvent(event);
                  if (
                    !employeeNo ||
                    Number.isNaN(occurredAt.getTime()) ||
                    occurredAt < from ||
                    occurredAt > to ||
                    !attendance ||
                    (d.eventsClearedAt && occurredAt <= d.eventsClearedAt)
                  )
                    continue;
                  const deviceEventId = eventId(event, employeeNo, occurredAt);
                  const saved = existing.get(deviceEventId);
                  // Only skip exact matches: terminals can reuse serial numbers.
                  if (
                    saved &&
                    saved.employeeNo === employeeNo &&
                    saved.eventType === attendance.eventType &&
                    saved.occurredAt.getTime() === occurredAt.getTime()
                  )
                    continue;
                  // Most syncs only need events. Import users/cards once, and only
                  // when an unseen employee needs a local person/employee link.
                  if (!people.has(employeeNo) && !peopleRefreshed) {
                    peopleRefreshed = true;
                    const imported = await peopleService.sync(d.id);
                    peopleResult.synced += imported.synced;
                    peopleResult.errors.push(...imported.errors);
                    for (const person of await m.people(d.id))
                      people.set(person.employeeNo, person);
                  }
                  const p = people.get(employeeNo);
                  const result = await m.saveUnique(d.id, deviceEventId, {
                    personId: p?.id,
                    employeeNo,
                    personName: event.name ?? p?.name,
                    eventType: attendance.eventType,
                    occurredAt,
                    verification: attendance.verification,
                  });
                  if (result.created) synced++;
                }
                position += list.length;
                const more =
                  info.responseStatusStrg === "MORE" ||
                  position < Number(info.totalMatches ?? position);
                if (!more) {
                  complete = true;
                  break;
                }
                if (!list.length)
                  throw new Error(
                    "The terminal returned incomplete event search data.",
                  );
              }
              if (!complete)
                throw new Error(
                  "The terminal event history exceeded the sync limit; some events may not have been imported.",
                );
            }
            await m.status(d.id, { status: "online", lastSeenAt: new Date() });
            return { deviceId: d.id, synced };
          } catch (error) {
            await m.status(d.id, { status: "offline" }).catch(() => {});
            return {
              synced,
              error: {
                deviceId: d.id,
                deviceName: d.name,
                message: error.message,
              },
            };
          }
        }),
      );
      return {
        synced: results.reduce((total, result) => total + result.synced, 0),
        usersSynced: peopleResult.synced,
        errors: [
          ...peopleResult.errors,
          ...results.flatMap((result) => (result.error ? [result.error] : [])),
        ],
      };
    } finally {
      syncInProgress = false;
    }
  },
};
