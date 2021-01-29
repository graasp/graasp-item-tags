// global
import { DatabaseTransactionHandler, GraaspError } from 'graasp';
import { Task, TaskStatus } from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTag } from '../interfaces/item-tag';
import { ItemTagService } from '../db-service';

export abstract class BaseItemTagTask implements Task<Member, ItemTag> {
  protected itemService: ItemService;
  protected itemMembershipService: ItemMembershipService;
  protected itemTagService: ItemTagService;
  protected _status: TaskStatus;
  protected _result: ItemTag | ItemTag[];
  protected _message: string;

  readonly actor: Member;

  targetId: string;
  data: Partial<ItemTag>;

  constructor(actor: Member,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    this.actor = actor;
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.itemTagService = itemTagService;
  }

  abstract get name(): string;
  get status(): TaskStatus { return this._status; }
  get result(): ItemTag | ItemTag[] { return this._result; }
  get message(): string { return this._message; }

  protected failWith(error: GraaspError): void {
    this._status = 'FAIL';
    this._message = error.name;
    throw error;
  }

  abstract run(handler: DatabaseTransactionHandler): Promise<void | BaseItemTagTask[]>;
}
