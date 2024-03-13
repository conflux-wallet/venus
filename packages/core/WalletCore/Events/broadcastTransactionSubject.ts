import { BehaviorSubject, filter } from 'rxjs';
import { Transaction } from 'ethers';
import { type WalletTransactionType } from '../Plugins/Transaction/types';

export interface TransactionSubjectValue {
  txHash: string;
  txRaw: string;
  transaction: Transaction;
  extraParams: Pick<WalletTransactionType, 'assetType' | 'contractAddress' | 'to'> & {
    sendAt: Date,
  };
}

export const broadcastTransactionSubjectPush = new BehaviorSubject<TransactionSubjectValue | null>(null);

const notNull = <T>(value: T | null): value is T => value !== null;

export const broadcastTransactionSubject = broadcastTransactionSubjectPush.pipe(filter(notNull));
