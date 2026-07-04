import { z } from 'zod';

export const ContentBlockSchema = z.union([
  z.object({ type: z.literal('text'), value: z.string() }),
  z.object({ type: z.literal('image'), value: z.string(), caption: z.string().optional() }),
]);

export const KeyResultSchema = z.object({
  title: z.string(),
  done: z.boolean(),
});

export const LearningSchema = z.object({
  id: z.number().optional(),
  category: z.string(),
  title: z.string(),
  source: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  duration_hours: z.number(),
  progress: z.number(),
  self_rating: z.number(),
  notes: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const TravelSchema = z.object({
  id: z.number().optional(),
  destination: z.string(),
  category: z.string(),
  country: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  mood: z.number(),
  weather: z.string(),
  highlights: z.string(),
  highlights_blocks: ContentBlockSchema.array().optional(),
  reflections: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const AchievementSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  module: z.string(),
  category: z.string(),
  subcategory: z.string(),
  source_id: z.number().nullable(),
  source_module: z.string(),
  source_title: z.string(),
  parent_id: z.number().nullable(),
  locked: z.boolean(),
  date: z.string(),
  description: z.string(),
  feeling: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const MoodSchema = z.object({
  id: z.number().optional(),
  date: z.string(),
  score: z.number(),
  emotions: z.string().array(),
  journal: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const GoalSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  category: z.string(),
  deadline: z.string(),
  key_results: KeyResultSchema.array(),
  note: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const HealthHabitSchema = z.object({
  id: z.number().optional(),
  habit_name: z.string(),
  frequency: z.string(),
  records: z.string().array().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const HealthLogSchema = z.object({
  id: z.number().optional(),
  category: z.string(),
  date: z.string(),
  exercise: z.string(),
  sleep: z.number(),
  water: z.number(),
  weight: z.number(),
  note: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const FinanceSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  category: z.string(),
  target_amount: z.number(),
  current_amount: z.number(),
  mood: z.number(),
  completion: z.number(),
  deadline: z.string(),
  note: z.string(),
  date: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const SocialSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  relationship: z.string(),
  category: z.string(),
  last_contact: z.string(),
  notes: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const InsightSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  category: z.string(),
  source: z.string(),
  date: z.string(),
  content: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const MilestoneSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  category: z.string(),
  target_date: z.string(),
  completed: z.boolean(),
  completion_date: z.string().optional(),
  description: z.string(),
  progress: z.number(),
  related_module: z.string(),
  related_id: z.number().optional(),
  priority: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateGoalSchema = GoalSchema.omit({ id: true, created_at: true, updated_at: true }).extend({
  keyResults: KeyResultSchema.array().optional(),
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const ToggleKRParamsSchema = z.object({
  krIndex: z.number(),
});

export const CreateHabitSchema = HealthHabitSchema.omit({ id: true, records: true, created_at: true, updated_at: true }).extend({
  habitName: z.string(),
});

export const ToggleHabitParamsSchema = z.object({
  date: z.string(),
});

export const CreateLogSchema = HealthLogSchema.omit({ id: true, created_at: true, updated_at: true });

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type KeyResult = z.infer<typeof KeyResultSchema>;
export type Learning = z.infer<typeof LearningSchema>;
export type Travel = z.infer<typeof TravelSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Mood = z.infer<typeof MoodSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type HealthHabit = z.infer<typeof HealthHabitSchema>;
export type HealthLog = z.infer<typeof HealthLogSchema>;
export type Finance = z.infer<typeof FinanceSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;