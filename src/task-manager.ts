// global
import { TaskManager } from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTagService } from './db-service';
import { ItemTag } from './interfaces/item-tag';
import { CreateItemTagTask } from './tasks/create-item-tag-task';
import { DeleteItemTagTask } from './tasks/delete-item-tag-task';
import { BaseItemTagTask } from './tasks/base-item-tag-task';
import { GetItemsItemTagsTask } from './tasks/get-items-item-tags-task';

export class ItemTagTaskManager implements TaskManager<Member, ItemTag> {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private itemTagService: ItemTagService;

  constructor(
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.itemTagService = itemTagService;
  }
  getCreateTaskName(): string { return CreateItemTagTask.name; }
  getGetTaskName(): string { throw new Error('Method not implemented.'); }
  getUpdateTaskName(): string { throw new Error('Method not implemented.'); }
  getDeleteTaskName(): string { return DeleteItemTagTask.name; }

  // CRUD
  createCreateTask(member: Member, data: Partial<ItemTag>, itemId: string): CreateItemTagTask {
    return new CreateItemTagTask(member, data, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createGetTask(actor: Member, objectId: string): BaseItemTagTask {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createUpdateTask(member: Member, objectId: string, data: Partial<ItemTag>): BaseItemTagTask {
    throw new Error('Method not implemented.');
  }

  createDeleteTask(member: Member, id: string, itemId: string): DeleteItemTagTask {
    return new DeleteItemTagTask(member, id, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }

  // Other
  createGetItemsItemTagsTask(actor: Member, itemId: string): GetItemsItemTagsTask {
    return new GetItemsItemTagsTask(actor, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }
}
