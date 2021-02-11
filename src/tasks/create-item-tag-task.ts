// global
import { FastifyLoggerInstance } from 'fastify';
import { DatabaseTransactionHandler, PreHookHandlerType } from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import {
  ItemNotFound, UserCannotAdminItem, ItemHasTag,
  TagNotFound, ConflictingTagsInTheHierarchy
} from '../util/graasp-item-tags-error';
import { ItemTagService } from '../db-service';
import { BaseItemTagTask } from './base-item-tag-task';
import { BaseItemTag } from '../base-item-tag';
import { ItemTagCreateHookHandlerExtraData } from '../interfaces/item-tag-task';
import { ItemTag } from '../interfaces/item-tag';

export class CreateItemTagTask extends BaseItemTagTask {
  get name(): string { return CreateItemTagTask.name; }
  private subtasks: BaseItemTagTask[];
  preHookHandler: PreHookHandlerType<ItemTag, ItemTagCreateHookHandlerExtraData>;

  constructor(member: Member, data: Partial<ItemTag>, itemId: string,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    super(member, itemService, itemMembershipService, itemTagService);
    this.data = data;
    this.targetId = itemId;
  }

  get result(): ItemTag | ItemTag[] {
    return !this.subtasks ? this._result : this.subtasks[this.subtasks.length - 1].result;
  }

  async run(handler: DatabaseTransactionHandler, log: FastifyLoggerInstance): Promise<void> {
    this.status = 'RUNNING';

    // get item that the new tag will target
    const item = await this.itemService.get(this.targetId, handler);
    if (!item) throw new ItemNotFound(this.targetId);

    // verify if member adding the new tag has rights for that
    const hasRights = await this.itemMembershipService.canAdmin(this.actor, item, handler);
    if (!hasRights) throw new UserCannotAdminItem(this.targetId);

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
      const itemTagsAboveAndBelow = await this.itemTagService.getAllBelowOrAbove(item, tagId, handler);
      if (itemTagsAboveAndBelow.length > 0) throw new ConflictingTagsInTheHierarchy(tagId);
    }

    const itemTag = new BaseItemTag(tagId, item.path, this.actor.id);

    // create tag
    this.preHookHandler?.(itemTag, this.actor, { log }, { target: item });
    this._result = await this.itemTagService.create(itemTag, handler);
    this.status = 'OK';
  }
}
