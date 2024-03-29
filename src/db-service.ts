import { DatabaseTransactionConnection as TrxHandler, sql } from 'slonik';

import { Item } from '@graasp/sdk';

import { ItemTag } from './interfaces/item-tag';
import { Tag } from './interfaces/tag';

/**
 * Database's first layer of abstraction for Item Tags and (exceptionally) for Tags (at the bottom)
 */
export class ItemTagService {
  // the 'safe' way to dynamically generate the columns names:
  private static allColumns = sql.join(
    [
      'id',
      ['tag_id', 'tagId'],
      ['item_path', 'itemPath'],
      'creator',
      ['created_at', 'createdAt'],
    ].map((c) =>
      !Array.isArray(c)
        ? sql.identifier([c])
        : sql.join(
            c.map((cwa) => sql.identifier([cwa])),
            sql` AS `,
          ),
    ),
    sql`, `,
  );

  /**
   * Get all item tags, local or inherited, for the given `item`.
   * @param item Item
   * @param transactionHandler Database transaction handler
   */
  async getAll(item: Item, transactionHandler: TrxHandler): Promise<ItemTag[]> {
    return (
      transactionHandler
        .query<ItemTag>(
          sql`
        SELECT ${ItemTagService.allColumns} FROM item_tag
        WHERE item_path @> ${item.path}
        ORDER BY nlevel(item_path) DESC
      `,
        )
        // TODO: is there a better way?
        .then(({ rows }) => rows.slice(0))
    );
  }

  /**
   * Check if item has (local) tag.
   * @param item Item
   * @param tagId Tag id
   * @param transactionHandler Database transaction handler
   */
  async hasTag(item: Item, tagId: string, transactionHandler: TrxHandler): Promise<boolean> {
    return transactionHandler
      .oneFirst<string>(
        sql`
        SELECT count(*) FROM item_tag
        WHERE tag_id = ${tagId} AND item_path = ${item.path}
      `,
      )
      .then((count) => parseInt(count, 10) === 1);
  }

  /**
   * Check if item has tags.
   * @param item Item
   * @param tagIds array of tag id
   * @param transactionHandler Database transaction handler
   */
  async hasTags(item: Item, tagIds: string[], transactionHandler: TrxHandler): Promise<boolean> {
    return transactionHandler
      .oneFirst<string>(
        sql`
        SELECT count(*) FROM item_tag
        WHERE tag_id IN (${sql.join(tagIds, sql`, `)}) AND item_path = ${item.path}
      `,
      )
      .then((count) => parseInt(count, 10) === tagIds.length);
  }

  /**
   * Create ItemTag.
   * @param itemTag Partial ItemTag object with `tagId`, `itemPath`, `creator`.
   * @param transactionHandler Database transaction handler
   */
  async create(itemTag: Partial<ItemTag>, transactionHandler: TrxHandler): Promise<ItemTag> {
    const { tagId, itemPath, creator } = itemTag;
    return transactionHandler
      .query<ItemTag>(
        sql`
        INSERT INTO item_tag (tag_id, item_path, creator)
        VALUES (${tagId}, ${itemPath}, ${creator})
        RETURNING ${ItemTagService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Delete ItemTag.
   * @param id ItemTag id
   * @param transactionHandler Database transaction handler
   */
  async delete(id: string, transactionHandler: TrxHandler): Promise<ItemTag> {
    return transactionHandler
      .query<ItemTag>(
        sql`
        DELETE FROM item_tag
        WHERE id = ${id}
        RETURNING ${ItemTagService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Delete ItemTag if at given item (matching item's path).
   * @param id ItemTag id
   * @param item Item
   * @param transactionHandler Database transaction handler
   */
  async deleteAtItem(id: string, item: Item, transactionHandler: TrxHandler): Promise<ItemTag> {
    return transactionHandler
      .query<ItemTag>(
        sql`
        DELETE FROM item_tag
        WHERE id = ${id}
          AND item_path = ${item.path}
        RETURNING ${ItemTagService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Get item tags, w/ `tagId`, "below" or "above" the given `item`, ordered by
   * longest to shortest path - lowest in the tree to highest in the tree.
   * @param item Item whose path should be considered
   * @param tagId Tag id
   * @param transactionHandler Database transaction handler
   */
  async getAllBelowOrAbove(
    item: Item,
    tagId: string,
    transactionHandler: TrxHandler,
  ): Promise<ItemTag[]> {
    return (
      transactionHandler
        .query<ItemTag>(
          sql`
        SELECT ${ItemTagService.allColumns}
        FROM item_tag
        WHERE tag_id = ${tagId}
          AND (${item.path} @> item_path OR item_path @> ${item.path})
          AND item_path != ${item.path}
        ORDER BY nlevel(item_path) DESC
      `,
        )
        // TODO: is there a better way?
        .then(({ rows }) => rows.slice(0))
    );
  }

  /**
   * Checks for the existence of same tags with "nesting" rule 'fail' at
   * `path1` (and descendants) and `path2` (and ancestors).
   * @param itemPath1 Item path 1
   * @param itemPath2 Item path 2
   * @param transactionHandler Database transaction handler
   */
  async haveConflictingTags(
    itemPath1: string,
    itemPath2: string,
    transactionHandler: TrxHandler,
  ): Promise<boolean> {
    return transactionHandler
      .query<{ tagId: string; total: number }>(
        sql`
        SELECT tag_id AS "tagId", count(*) AS "total"
        FROM item_tag
        WHERE (${itemPath1} @> item_path -- get all below, or at, item1
          OR item_path @> ${itemPath2}) -- get all above, or at, item2
          AND tag_id IN (SELECT id FROM tag WHERE nested = 'fail')
        GROUP BY tag_id
      `,
      )
      .then(({ rows }) => rows.some(({ total }) => total > 1));
  }

  /**
   * Copy tags from one item to another
   * @param from Item
   * @param to Item
   * @param creatorId Creator id
   * @param transactionHandler Database transaction handler
   */
  async copyTags(
    from: Item,
    to: Item,
    creatorId: string,
    transactionHandler: TrxHandler,
  ): Promise<readonly ItemTag[]> {
    return transactionHandler
      .query<ItemTag>(
        sql`
        INSERT INTO item_tag (tag_id, item_path, creator)
        SELECT tag_id, ${to.path}, ${creatorId}
        FROM item_tag
        WHERE item_path = ${from.path}
      `,
      )
      .then(({ rows }) => rows);
  }

  // TODO: this was to clean duplicate/nested tags.
  // async removeRedundantTagsBelowItem(item: Item, transactionHandler: TrxHandler): Promise<void> {
  //   await transactionHandler
  //     .query(sql`
  //       WITH tags_count AS (
  //         SELECT tag_id, count(*) as "total"
  //         FROM item_tag
  //         WHERE ${item.path} @> item_path -- get all below, or at, item
  //           OR item_path @> ${item.path} -- get all above, or at, item
  //         GROUP BY tag_id
  //       )
  //       DELETE FROM item_tag
  //       WHERE ${item.path} @> item_path
  //         AND tag_id IN (SELECT tag_id FROM tags_count WHERE total > 1)
  //     `);
  // }

  // Tags
  private static allColumnsTags = sql.join(
    ['id', 'name', 'nested', ['created_at', 'createdAt']].map((c) =>
      !Array.isArray(c)
        ? sql.identifier([c])
        : sql.join(
            c.map((cwa) => sql.identifier([cwa])),
            sql` AS `,
          ),
    ),
    sql`, `,
  );

  /**
   * Get tag.
   * @param id Tag id
   * @param transactionHandler Database transaction handler
   */
  async getTag(tagId: string, transactionHandler: TrxHandler): Promise<Tag> {
    return transactionHandler
      .query<Tag>(
        sql`
        SELECT ${ItemTagService.allColumnsTags} FROM tag
        WHERE id = ${tagId}
      `,
      )
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Get all available tags.
   * @param transactionHandler Database transaction handler
   */
  async getAllTags(transactionHandler: TrxHandler): Promise<readonly Tag[]> {
    return transactionHandler
      .query<Tag>(
        sql`
        SELECT ${ItemTagService.allColumnsTags}
        FROM tag
      `,
      )
      .then(({ rows }) => rows);
  }

  /**
   * Get item paths which have tagIds.
   * @param tagIds tag ids
   * @param transactionHandler Database transaction handler
   * @returns item paths
   */
  async getItemPathsByTags(
    tagIds: string[],
    transactionHandler: TrxHandler,
  ): Promise<readonly { item_path: string }[]> {
    return transactionHandler
      .query<{ item_path: string }>(
        sql`
        SELECT item_path from item_tag 
        WHERE tag_id IN (${sql.join(tagIds, sql`, `)})
        GROUP BY item_path
        HAVING COUNT(*)>=${tagIds.length}
    `,
      )
      .then(({ rows }) => rows);
  }

  /**
   * Delete item-tags of given item
   * @param itemPath item_path of given item
   * @param tagIds a list of tags need to be deleted
   * @param transactionHandler Database transaction handler
   */
  async deleteItemTagsByItemId(
    itemPath: string,
    tagIds: string[],
    transactionHandler: TrxHandler,
  ): Promise<number> {
    return transactionHandler
      .query<ItemTag>(
        sql`
        DELETE FROM item_tag
        WHERE item_path = ${itemPath} AND tag_id IN (${sql.join(tagIds, sql`, `)})
        RETURNING *
      `,
      )
      .then(({ rows }) => rows.length);
  }
}
