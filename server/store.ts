import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { Meeting } from "../src/live/types";
import { initialMeeting } from "../src/live/model";
export class MeetingStore {
  private queue = Promise.resolve();
  private pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;
  private file = path.resolve(process.env.DATA_DIR || ".data", "meeting.json");
  readonly mode = this.pool
    ? "postgres"
    : process.env.DATA_DIR
      ? "persistent-volume"
      : "local-file";
  async read(): Promise<Meeting> {
    if (this.pool) {
      const result = await this.pool.query(
        "select document from turf_meetings where id=$1",
        [initialMeeting().id],
      );
      return result.rows[0]?.document || initialMeeting();
    }
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return initialMeeting();
    }
  }
  mutate(fn: (state: Meeting) => Meeting | Promise<Meeting>): Promise<Meeting> {
    const job = this.queue.then(async () => {
      if (
        process.env.NODE_ENV === "production" &&
        !this.pool &&
        !process.env.DATA_DIR
      )
        throw new Error("Durable storage is required");
      if (!this.pool) {
        const current = await this.read();
        const next = await fn(current);
        if (next === current) return current;
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        await fs.writeFile(`${this.file}.tmp`, JSON.stringify(next));
        await fs.rename(`${this.file}.tmp`, this.file);
        return next;
      }
      const db = await this.pool.connect();
      try {
        await db.query("begin");
        await db.query(
          "insert into turf_meetings(id,document) values ($1,$2) on conflict do nothing",
          [initialMeeting().id, initialMeeting()],
        );
        const locked = await db.query(
          "select document from turf_meetings where id=$1 for update",
          [initialMeeting().id],
        );
        const current: Meeting = locked.rows[0].document;
        const next = await fn(current);
        for (const event of next.events.slice(current.events.length))
          await db.query(
            "insert into turf_audit(id,meeting_id,document) values($1,$2,$3)",
            [event.id, next.id, event],
          );
        for (const item of next.snapshots)
          await db.query(
            "insert into turf_snapshots(id,meeting_id,document) values($1,$2,$3) on conflict do nothing",
            [item.id, next.id, item],
          );
        await db.query("update turf_meetings set document=$2 where id=$1", [
          next.id,
          next,
        ]);
        await db.query("commit");
        return next;
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        db.release();
      }
    });
    this.queue = job.then(
      () => {},
      () => {},
    );
    return job;
  }
}
