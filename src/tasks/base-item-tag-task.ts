import { FastifyLoggerInstance } from 'fastify';

import {
  Actor,
  DatabaseTransactionHandler,
  IndividualResultType,
  ItemMembershipService,
  ItemService,
  PostHookHandlerType,
  PreHookHandlerType,
  Task,
  TaskStatus,
} from '@graasp/sdk';

import { ItemTagService } from '..';

export abstract class BaseItemTagTask<A extends Actor, R> implements Task<A, R> {
  protected _result: R;
  protected _message: string;
  readonly actor: A;
  protected _partialSubtasks: boolean;

  status: TaskStatus;
  targetId: string;
  data: Partial<IndividualResultType<R>>;
  preHookHandler?: PreHookHandlerType<R>;
  postHookHandler?: PostHookHandlerType<R>;

  getInput?: () => unknown;
  getResult?: () => unknown;

  protected itemTagService: ItemTagService;
  protected itemMembershipService: ItemMembershipService;
  protected itemService: ItemService;
  protected publicTagId: string;

  constructor(
    actor: A,
    itemTagService: ItemTagService,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
  ) {
    this.actor = actor;
    this.status = TaskStatus.NEW;
    this.itemService = itemService;
    this.itemTagService = itemTagService;
    this.itemMembershipService = itemMembershipService;
  }

  abstract get name(): string;
  get result(): R {
    return this._result;
  }
  get message(): string {
    return this._message;
  }
  get partialSubtasks(): boolean {
    return this._partialSubtasks;
  }

  input?: unknown;
  skip?: boolean;

  abstract run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void | BaseItemTagTask<A, R>[]>;
}
