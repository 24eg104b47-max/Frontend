import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(150),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  startDate: z.string().optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  status: z.string().min(1),
  category: z.string().max(60).optional().or(z.literal('')),
  tags: z.string().max(200).optional().or(z.literal('')),
  estimatedMinutes: z.union([z.string(), z.number()]).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  projectId: z.union([z.string(), z.number()]).optional().or(z.literal('')),
  subtasks: z.array(z.object({
    title: z.string().min(1),
    done: z.boolean().optional()
  })).optional()
}).refine((v) => {
  if (!v.deadline) return true;
  return new Date(v.deadline) >= new Date(new Date().toDateString());
}, { message: 'Deadline cannot be in the past', path: ['deadline'] });
