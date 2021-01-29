// global
import { sql, DatabaseTransactionConnectionType as TrxHandler } from 'slonik';
// other services
import { Item } from 'graasp';
// local
import { ItemTag } from './interfaces/item-tag';

export class ItemTagService {
  // the 'safe' way to dynamically generate the columns names:
  private static allColumns = sql.join(
    [
      'id',
      ['tag_id', 'tagId'],
      ['item_path', 'itemPath'],
      'creator',
      ['created_at', 'createdAt'],
    ].map(c =>
      !Array.isArray(c) ?
        sql.identifier([c]) :
        sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
    ),
    sql`, `
  );

  /**
   * Get all tags, local or inherited, for the given `item`.
   * @param item Item
   * @param transactionHandler Database transaction handler
   */
  async getAll(item: Item, transactionHandler: TrxHandler): Promise<ItemTag[]> {
    return transactionHandler.query<ItemTag>(sql`
        SELECT ${ItemTagService.allColumns} FROM item_tag
        WHERE item_path @> ${item.path}
        ORDER BY nlevel(item_path) DESC
      `)
      // TODO: is there a better way?
      .then(({ rows }) => rows.slice(0));
  }

  /**
   * Check if item has tag (local or inherited).
   * @param item Item
   * @param tagId Tag id
   * @param transactionHandler Database transaction handler
   */
  async hasTag(item: Item, tagId: string, transactionHandler: TrxHandler): Promise<boolean> {
    return transactionHandler
      .oneFirst(sql`
        SELECT count(*) FROM item_tag
        WHERE tag_id = ${tagId} AND item_path @> ${item.path}
      `)
      .then((count: string) => parseInt(count, 10) > 0);
  }

  /**
   * Create ItemTag.
   * @param itemTag Partial ItemTag object with `tagId`, `itemPath`, `creator`.
   * @param transactionHandler Database transaction handler
   */
  async create(itemTag: Partial<ItemTag>, transactionHandler: TrxHandler): Promise<ItemTag> {
    const { tagId, itemPath, creator } = itemTag;
    return transactionHandler.query<ItemTag>(sql`
        INSERT INTO item_tag (tag_id, item_path, creator)
        VALUES (${tagId}, ${itemPath}, ${creator})
        RETURNING ${ItemTagService.allColumns}
      `)
      .then(({ rows }) => rows[0]);
  }

  /**
   * Delete ItemTag.
   * @param id ItemTag id
   * @param transactionHandler Database transaction handler
   */
  async delete(id: string, transactionHandler: TrxHandler): Promise<ItemTag> {
    return transactionHandler.query<ItemTag>(sql`
        DELETE FROM item_tag
        WHERE id = ${id}
        RETURNING ${ItemTagService.allColumns}
      `)
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Get tag "below" the given `item`'s path
   * longest to shortest path - lowest in the (sub)tree to highest in the (sub)tree.
   * @param item Item whose path should be considered
   * @param tagId Tag id
   * @param transactionHandler Database transaction handler
   */
  async getAllBelow(item: Item, tagId: string, transactionHandler: TrxHandler): Promise<ItemTag[]> {
    return transactionHandler.query<ItemTag>(sql`
        SELECT ${ItemTagService.allColumns}
        FROM item_tag
        WHERE tag_id = ${tagId}
          AND ${item.path} @> item_path
          AND item_path != ${item.path}
        ORDER BY nlevel(item_path) DESC
      `)
      // TODO: is there a better way?
      .then(({ rows }) => rows.slice(0));
  }
}
