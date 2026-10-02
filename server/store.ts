import { optionalSetting } from "./settings";
import { databaseOptions } from "./database";
import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { Meeting } from "../src/live/types";
import { isMeeting } from "../src/live/validation";
import { initialMeeting } from "../src/live/model";
export class MeetingStore {
  private queue = Promise.resolve();
  private pool = optionalSetting("DATABASE_URL")
    ? new Pool({
        ...databaseOptions(optionalSetting("DATABASE_URL")!),
        max: 3,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        allowExitOnIdle: true,
      })
    : null;
  private file = path.resolve(
    optionalSetting("DATA_DIR") || ".data",
    "meeting.json",
  );
  readonly mode = this.pool
    ? "postgres"
    : optionalSetting("DATA_DIR")
      ? "persistent-volume"
      : "local-file";
  private limits = new Map<string, { count: number; expires: number }>();
  async consumeRateLimit(key: string, maximum: number, windowMs: number) {
    if (this.pool) {
      const result = await this.pool.query(
        `insert into turf_rate_limits(key, count, expires_at)
         values ($1, 1, clock_timestamp() + $2 * interval '1 millisecond')
         on conflict(key) do update set
           count = case when turf_rate_limits.expires_at <= clock_timestamp()
             then 1 else turf_rate_limits.count + 1 end,
           expires_at = case when turf_rate_limits.expires_at <= clock_timestamp()
             then clock_timestamp() + $2 * interval '1 millisecond'
             else turf_rate_limits.expires_at end
         returning count`,
        [key, windowMs],
      );
      return result.rows[0].count <= maximum;
    }
    if (process.env.VERCEL === "1")
      throw new Error("Shared rate-limit storage is required");
    const now = Date.now();
    for (const [id, usage] of this.limits)
      if (usage.expires <= now) this.limits.delete(id);
    const usage = this.limits.get(key) || { count: 0, expires: now + windowMs };
    usage.count++;
    this.limits.set(key, usage);
    return usage.count <= maximum;
  }
  async read(): Promise<Meeting> {
    if (this.pool) {
      const result = await this.pool.query(
        "select document from turf_meetings where id=$1",
        [initialMeeting().id],
      );
      const state = result.rows[0]?.document || initialMeeting();
      if (!isMeeting(state)) throw new Error("Stored meeting is invalid");
      return state;
    }
    if (process.env.VERCEL === "1")
      throw new Error("Durable database storage is required on Vercel");
    try {
      const state: unknown = JSON.parse(await fs.readFile(this.file, "utf8"));
      if (!isMeeting(state)) throw new Error("Stored meeting is invalid");
      return state;
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
        !optionalSetting("DATA_DIR")
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
