// global
import { DatabaseTransactionHandler } from 'graasp';
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
import { ItemTag } from '../interfaces/item-tag';
// import { DeleteItemTagSubTask } from './delete-item-tag-task';

// class CreateItemTagSubTask extends BaseItemTagTask {
//   get name() { return CreateItemTagSubTask.name; }

//   constructor(member: Member, itemTag: ItemTag,
//     itemService: ItemService, itemMembershipService: ItemMembershipService,
//     itemTagService: ItemTagService) {
//     super(member, itemService, itemMembershipService, itemTagService);
//     this.data = itemTag;
//   }

//   async run(handler: DatabaseTransactionHandler) {
//     this.status = 'RUNNING';
//     const itemTag = await this.itemTagService.create(this.data, handler);
//     this.status = 'OK';
//     this._result = itemTag;
//   }
// }

export class CreateItemTagTask extends BaseItemTagTask {
  get name(): string { return CreateItemTagTask.name; }
  private subtasks: BaseItemTagTask[];

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

  async run(handler: DatabaseTransactionHandler): Promise<void> {
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


    const itemTag = new BaseItemTag(tagId, item.path, this.actor.id);

    // check tags lower in the tree
    const itemTagsBelow = await this.itemTagService.getAllBelow(item, tagId, handler);
    if (itemTagsBelow.length > 0) {
      // check tag's "nesting" rule
      if (tag.nested === 'fail') throw new ConflictingTagsInTheHierarchy(tagId);

      // // clean items below
      // // return subtasks to remove redundant existing tags and to create the new one
      // this.status = 'DELEGATED';
      // this.subtasks = itemTagsBelow
      //   .map(it => new DeleteItemTagSubTask(
      //     this.actor, it.id,
      //     this.itemService, this.itemMembershipService, this.itemTagService
      //   ))
      //   .concat(new CreateItemTagSubTask(
      //     this.actor, itemTag,
      //     this.itemService, this.itemMembershipService, this.itemTagService
      //   ));

      // return this.subtasks;
    }

    // create tag
    this._result = await this.itemTagService.create(itemTag, handler);
    this.status = 'OK';
  }
}
