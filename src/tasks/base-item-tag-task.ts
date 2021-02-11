// global
import { FastifyLoggerInstance } from 'fastify';
import { DatabaseTransactionHandler, PostHookHandlerType, PreHookHandlerType } from 'graasp';
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
  protected _result: ItemTag | ItemTag[];
  protected _message: string;

  readonly actor: Member;

  status: TaskStatus;
  targetId: string;
  data: Partial<ItemTag>;
  preHookHandler: PreHookHandlerType<ItemTag>;
  postHookHandler: PostHookHandlerType<ItemTag>;

  constructor(actor: Member,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    this.actor = actor;
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.itemTagService = itemTagService;
    this.status = 'NEW';
  }

  abstract get name(): string;
  get result(): ItemTag | ItemTag[] { return this._result; }
  get message(): string { return this._message; }

  abstract run(handler: DatabaseTransactionHandler, log?: FastifyLoggerInstance): Promise<void | BaseItemTagTask[]>;
}
