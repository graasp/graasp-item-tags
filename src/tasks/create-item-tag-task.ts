// global
import { FastifyLoggerInstance } from 'fastify';

import { Actor, DatabaseTransactionHandler, PreHookHandlerType, TaskStatus } from '@graasp/sdk';
// other services
import { ItemMembershipService, ItemService } from '@graasp/sdk';

import { BaseItemTag } from '../base-item-tag';
import { ItemTagService } from '../db-service';
import { ItemTag } from '../interfaces/item-tag';
import { ItemTagCreateHookHandlerExtraData } from '../interfaces/item-tag-task';
// local
import {
  ConflictingTagsInTheHierarchy,
  ItemHasTag,
  ItemNotFound,
  MemberCannotAdminItem,
  TagNotFound,
} from '../util/graasp-item-tags-error';
import { BaseItemTagTask } from './base-item-tag-task';

export class CreateItemTagTask extends BaseItemTagTask<Actor, ItemTag> {
  get name(): string {
    return CreateItemTagTask.name;
  }
  preHookHandler: PreHookHandlerType<ItemTag, ItemTagCreateHookHandlerExtraData>;

  constructor(
    member: Actor,
    data: Partial<ItemTag>,
    itemId: string,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
    this.data = data;
    this.targetId = itemId;
  }

  async run(handler: DatabaseTransactionHandler, log: FastifyLoggerInstance): Promise<void> {
    this.status = TaskStatus.RUNNING;

    // get item that the new tag will target
    const item = await this.itemService.get(this.targetId, handler);
    if (!item) throw new ItemNotFound(this.targetId);

    // verify if member adding the new tag has rights for that
    const hasRights = await this.itemMembershipService.canAdmin(this.actor.id, item, handler);
    if (!hasRights) throw new MemberCannotAdminItem(this.targetId);

    const tagId = this.data.tagId;

    // check if tag exists
    const tag = await this.itemTagService.getTag(tagId, handler);
    if (!tag) throw new TagNotFound(tagId);

    // check if item already has tag (locally)
    const hasTag = await this.itemTagService.hasTag(item, tagId, handler);
    if (hasTag) throw new ItemHasTag(tagId);

    // check tag's "nesting" rule
    if (tag.nested === 'fail') {
      // check if tag exists "lower" in the tree or in the ancestors
      const itemTagsAboveAndBelow = await this.itemTagService.getAllBelowOrAbove(
        item,
        tagId,
        handler,
      );
      if (itemTagsAboveAndBelow.length > 0) throw new ConflictingTagsInTheHierarchy(tagId);
    }

    const itemTag = new BaseItemTag(tagId, item.path, this.actor.id);

    // create tag
    this.preHookHandler?.(itemTag, this.actor, { log }, { target: item });
    this._result = await this.itemTagService.create(itemTag, handler);
    this.status = TaskStatus.OK;
  }
}
