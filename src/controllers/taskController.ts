import { Request, Response } from 'express';
import { z } from 'zod';
import { taskEngine } from '../services/taskEngine';
import { agentRegistry } from '../services/agentRegistry';

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  requiredCapability: z.enum(['solidity-audit', 'market-intelligence']),
  budgetUsdc: z.number().positive(),
  clientHandle: z.string().min(2),
});

export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const task = await taskEngine.createTask(validated);
    res.status(201).json(task);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getTaskHandler = (req: Request, res: Response): void => {
  const task = taskEngine.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
};

export const verifyPaymentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await taskEngine.verifyAndProcess(req.params.id);
    res.json(task);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const listWorkersHandler = (_req: Request, res: Response): void => {
  const workers = agentRegistry.getAllWorkers().map((w) => ({
    id: w.id,
    name: w.name,
    capability: w.capability,
    mooveHandle: `@${w.mooveHandle}`,
  }));
  res.json(workers);
};

const registerWorkerSchema = z.object({
  name: z.string().min(3),
  capability: z.string().min(3),
  mooveHandle: z.string().min(2),
  webhookUrl: z.string().url().optional(),
});

export const registerWorkerHandler = (req: Request, res: Response): void => {
  try {
    const validated = registerWorkerSchema.parse(req.body);
    const worker = agentRegistry.registerThirdPartyWorker(validated);
    res.status(201).json({
      message: 'Worker registered successfully',
      worker: {
        id: worker.id,
        name: worker.name,
        capability: worker.capability,
        mooveHandle: `@${worker.mooveHandle}`,
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};