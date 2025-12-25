import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Training Session CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveTraining', () => {
    it('should save session and sets correctly', async () => {
        (supabase.auth.getUser as any).mockResolvedValue({ 
            data: { user: { id: 'user1' } } 
        });

        const mockUpsert = vi.fn().mockResolvedValue({ error: null });
        const mockDelete = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockResolvedValue({ error: null });
        const mockInsert = vi.fn().mockResolvedValue({ error: null });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'training_sessions') return { upsert: mockUpsert };
            if (table === 'session_sets') return { delete: mockDelete, eq: mockEq, insert: mockInsert };
            return {};
        });

        const session = {
            id: '22222222-2222-2222-2222-222222222222',
            workoutId: '33333333-3333-3333-3333-333333333333',
            date: new Date().toISOString(),
            startTime: Date.now(),
            endTime: Date.now() + 3600000,
            exerciseResults: {
                '44444444-4444-4444-4444-444444444444': [{ reps: 10, weight: 50, isWarmup: false, completed: true }]
            }
        };

        await db.saveTraining(session);

        expect(supabase.from).toHaveBeenCalledWith('training_sessions');
        expect(mockUpsert).toHaveBeenCalled();
        expect(supabase.from).toHaveBeenCalledWith('session_sets');
        expect(mockInsert).toHaveBeenCalled();
    });
  });
});

