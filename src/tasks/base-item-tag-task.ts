// global
import { FastifyLoggerInstance } from 'fastify';
import {
  Actor, DatabaseTransactionHandler, IndividualResultType,
  PostHookHandlerType, PreHookHandlerType, Task, TaskStatus
} from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTagService } from '../db-service';

export abstract class BaseItemTagTask<R> implements Task<Actor, R> {
  protected itemService: ItemService;
  protected itemMembershipService: ItemMembershipService;
  protected itemTagService: ItemTagService;
  protected _result: R;
  protected _message: string;

  readonly actor: Member;

  status: TaskStatus;
  targetId: string;
  data: Partial<IndividualResultType<R>>;
  preHookHandler: PreHookHandlerType<R>;
  postHookHandler: PostHookHandlerType<R>;

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
  get result(): R { return this._result; }
  get message(): string { return this._message; }

  abstract run(handler: DatabaseTransactionHandler, log?: FastifyLoggerInstance): Promise<void | BaseItemTagTask<R>[]>;
}
