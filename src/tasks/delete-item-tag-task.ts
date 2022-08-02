import {
  Actor,
  DatabaseTransactionHandler,
  ItemMembershipService,
  ItemService,
  TaskStatus,
} from '@graasp/sdk';

import { ItemTagService } from '../db-service';
import { ItemTag } from '../interfaces/item-tag';
import {
  ItemNotFound,
  ItemTagNotFound,
  MemberCannotAdminItem,
} from '../util/graasp-item-tags-error';
import { BaseItemTagTask } from './base-item-tag-task';

export class DeleteItemTagTask extends BaseItemTagTask<Actor, ItemTag> {
  get name(): string {
    return DeleteItemTagTask.name;
  }

  private itemId: string;

  constructor(
    member: Actor,
    id: string,
    itemId: string,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
    this.targetId = id;
    this.itemId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = TaskStatus.RUNNING;

    // get item in this tag+item (ItemTag)
    const item = await this.itemService.get(this.itemId, handler);
    if (!item) throw new ItemNotFound(this.itemId);

    // verify if member removing the tag has rights for that
    const hasRights = await this.itemMembershipService.canAdmin(this.actor.id, item, handler);
    if (!hasRights) throw new MemberCannotAdminItem(this.targetId);

    // delete tag
    const itemTag = await this.itemTagService.deleteAtItem(this.targetId, item, handler);
    if (!itemTag) throw new ItemTagNotFound(this.targetId);

    // return item tags
    this.status = TaskStatus.OK;
    this._result = itemTag;
  }
}
