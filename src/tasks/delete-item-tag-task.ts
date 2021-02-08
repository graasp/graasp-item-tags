// global
import { DatabaseTransactionHandler } from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemNotFound, UserCannotAdminItem, ItemTagNotFound } from '../util/graasp-item-tags-error';
import { ItemTagService } from '../db-service';
import { BaseItemTagTask } from './base-item-tag-task';

export class DeleteItemTagSubTask extends BaseItemTagTask {
  get name(): string { return DeleteItemTagSubTask.name; }

  constructor(member: Member, id: string,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    super(member, itemService, itemMembershipService, itemTagService);
    this.targetId = id;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';
    const itemTag = await this.itemTagService.delete(this.targetId, handler);
    this.status = 'OK';
    this._result = itemTag;
  }
}

export class DeleteItemTagTask extends BaseItemTagTask {
  get name(): string { return DeleteItemTagTask.name; }

  private itemId: string;

  constructor(member: Member, id: string, itemId: string,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    super(member, itemService, itemMembershipService, itemTagService);
    this.targetId = id;
    this.itemId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get item in this tag+item (ItemTag)
    const item = await this.itemService.get(this.itemId, handler);
    if (!item) throw new ItemNotFound(this.itemId);

    // verify if member removing the tag has rights for that
    const hasRights = await this.itemMembershipService.canAdmin(this.actor, item, handler);
    if (!hasRights) throw new UserCannotAdminItem(this.targetId);

    // delete tag
    const itemTag = await this.itemTagService.deleteAtItem(this.targetId, item, handler);

    if (!itemTag) throw new ItemTagNotFound(this.targetId);

    // return item tags
    this.status = 'OK';
    this._result = itemTag;
  }
}
