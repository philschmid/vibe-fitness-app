import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Workout CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkouts', () => {
    it('should fetch and format workouts correctly', async () => {
      const mockWorkoutsData = [
        {
          id: '55555555-5555-5555-5555-555555555555',
          name: 'Test Workout',
          workout_exercises: [
            {
              id: '66666666-6666-6666-6666-666666666666',
              order_index: 0,
              target_sets: 3,
              exercises: {
                id: '77777777-7777-7777-7777-777777777777',
                name: 'Test Exercise',
                default_sets: 3,
                has_warmup: true,
              },
            },
          ],
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockWorkoutsData,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const workouts = await db.getWorkouts();

      expect(supabase.from).toHaveBeenCalledWith('workouts');
      expect(workouts).toHaveLength(1);
      expect(workouts[0].name).toBe('Test Workout');
      expect(workouts[0].exercises).toHaveLength(1);
      expect(workouts[0].exercises[0].name).toBe('Test Exercise');
    });

    it('should handle errors', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      await expect(db.getWorkouts()).rejects.toThrow('Database error');
    });
  });

  describe('saveWorkout', () => {
    it('should throw error if user is not logged in', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
      
      await expect(db.saveWorkout({ id: '55555555-5555-5555-5555-555555555555', name: 'Test', exercises: [] }))
        .rejects.toThrow('User not logged in');
    });

    it('should save workout and exercises correctly', async () => {
      // Mock user
      (supabase.auth.getUser as any).mockResolvedValue({ 
        data: { user: { id: 'user1' } } 
      });

      // Mock chainable methods
      const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
      
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'workouts') return { upsert: mockUpsert };
        if (table === 'workout_exercises') return { delete: mockDelete, eq: mockEq, insert: mockInsert };
        if (table === 'exercises') return { upsert: mockUpsert };
        return {};
      });

      const workout = {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'New Workout',
        exercises: [
            { id: '77777777-7777-7777-7777-777777777777', name: 'Ex 1', sets: 3, hasWarmup: false }
        ]
      };

      await db.saveWorkout(workout);

      expect(supabase.from).toHaveBeenCalledWith('workouts');
      expect(supabase.from).toHaveBeenCalledWith('exercises');
      expect(supabase.from).toHaveBeenCalledWith('workout_exercises');
    });
  });

  describe('deleteWorkout', () => {
    it('should soft delete workout', async () => {
        const mockUpdate = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockResolvedValue({ error: null });

        (supabase.from as any).mockReturnValue({
            update: mockUpdate,
            eq: mockEq
        });

        await db.deleteWorkout('55555555-5555-5555-5555-555555555555');

        expect(supabase.from).toHaveBeenCalledWith('workouts');
        expect(mockUpdate).toHaveBeenCalledWith({ is_archived: true });
        expect(mockEq).toHaveBeenCalledWith('id', '55555555-5555-5555-5555-555555555555');
    });
  });
});

