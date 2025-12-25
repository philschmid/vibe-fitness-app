import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../services/db";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Daily Log CRUD Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveDailyLog", () => {
    it("should save daily log correctly", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: "user1" } },
      });

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        upsert: mockUpsert,
      });

      const log = {
        id: "d1",
        date: "2023-01-01",
        weight: 80,
        calories: 2500,
      };

      await db.saveDailyLog(log);

      expect(supabase.from).toHaveBeenCalledWith("daily_logs");
      expect(mockUpsert).toHaveBeenCalledWith({
        id: "d1",
        user_id: "user1",
        date: "2023-01-01",
        weight: 80,
        calories: 2500,
      });
    });
  });

  describe("getDailyLogs", () => {
    it("should fetch daily logs", async () => {
      const mockData = [
        { id: "d1", date: "2023-01-01", weight: 80, calories: 2500 },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: mockData, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const logs = await db.getDailyLogs();

      expect(supabase.from).toHaveBeenCalledWith("daily_logs");
      expect(logs).toHaveLength(1);
      expect(logs[0].weight).toBe(80);
    });
  });
});
