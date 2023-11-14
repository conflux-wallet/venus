import { withDatabase, withObservables as _withObservables, compose as _compose } from '@nozbe/watermelondb/react';
export { withDatabase, withObservables, useDatabase, type ExtractedObservables } from '@nozbe/watermelondb/react';
import { type flow } from 'lodash-es';
import _database from '.';
export { type Observable } from 'rxjs';

export const compose = _compose as typeof flow;
export type Database = typeof _database;

export function withObservablesFromDB(observeModels: Array<string>) {
  return compose(
    withDatabase,
    _withObservables([], ({ database }: { database: Database }) =>
      Object.fromEntries(observeModels.map((model) => [convertToCamelCase(model), database.collections.get(convertToSnake(model)).query().observe()]))
    )
  ) as ReturnType<typeof _withObservables>;
}

export function convertToCamelCase(str: string) {
  return str.replace(/_([a-zA-Z])/g, (_, letter) => letter.toUpperCase());
}

export function convertToSnake(camelCaseString: string): string {
  return camelCaseString.replace(/(?!^)([A-Z])/g, '_$1').toLowerCase();
}
// // eslint-disable-next-line @typescript-eslint/ban-types
// export const withObservables = _withObservables as ((...args: Parameters<typeof _withObservables>) => <T extends Function>(reactComponent: T) => T)