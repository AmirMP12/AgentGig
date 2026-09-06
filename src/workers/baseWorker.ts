import { TaskCapability, TaskResult } from '../types/task';

export abstract class BaseWorker {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly capability: TaskCapability;
  abstract readonly mooveHandle: string;

  abstract execute(inputDescription: string): Promise<TaskResult>;
}