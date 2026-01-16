import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  page = 1,
  pageSize = 10,
): Promise<PaginationResult<T>> {
  const [data, total] = await qb
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();
  return {
    list: data,
    total,
    page,
    pageSize,
  };
}
