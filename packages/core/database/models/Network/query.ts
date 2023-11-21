import { Q, type Query } from '@nozbe/watermelondb';
import { type Network } from '.';
import TableName from '../../TableName';
import { createModel, type ModelFields } from '../../helper/modelHelper';
import database from '../..';

export type NetworkParams = ModelFields<Network>;
export function createNetwork(params: NetworkParams, prepareCreate: true): Network;
export function createNetwork(params: NetworkParams): Promise<Network>;
export function createNetwork(params: NetworkParams, prepareCreate?: true) {
  return createModel<Network>({ name: TableName.Network, params, prepareCreate });
}

export const querySelectedNetwork = () => database.get(TableName.Network).query(Q.where('selected', true)) as unknown as Query<Network>;
export const queryNetworkById = async (networkId: string) => database.get(TableName.Network).find(networkId) as Promise<Network>;
export const queryNetworkByChainId = async (chainId: string) => {
  const networks = await database.get(TableName.Network).query(Q.where('chainId', chainId));
  return networks?.[0] as Network;
};
export const queryNetworkByNetId = async (netId: number) => {
  const networks = await database.get(TableName.Network).query(Q.where('netId', netId));
  return networks?.[0] as Network;
};
