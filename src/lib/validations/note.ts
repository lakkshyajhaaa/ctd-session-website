import { z } from "zod";

export const createNoteSchema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1, "Note content is required"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
