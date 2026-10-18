import { z } from "zod";
export const syncEventsSchema = z.object({
  deviceId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
