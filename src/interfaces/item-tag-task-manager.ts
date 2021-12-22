// global
import { Actor, Item, Task } from 'graasp';
// local
import { ItemTag } from './item-tag';

export interface ItemTagTaskManager<A extends Actor = Actor> {
  getCreateTaskName(): string;
  getGetTaskName(): string;
  getUpdateTaskName(): string;
  getDeleteTaskName(): string;

  getGetOfItemTaskName(): string;

  createCreateTask(actor: A, object: Partial<ItemTag>, extra?: unknown): Task<A, ItemTag>;
  createGetTask(actor: A, objectId: string): Task<A, ItemTag>;
  createUpdateTask(actor: A, objectId: string, object: Partial<ItemTag>): Task<A, ItemTag>;
  createDeleteTask(actor: A, objectId: string, extra?: unknown): Task<A, ItemTag>;

  createGetOfItemTask(actor: A, item: Item): Task<A, ItemTag[]>;
}
