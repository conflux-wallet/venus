import { BehaviorSubject, filter } from 'rxjs';
import { ITxEvm } from './../Plugins/Transaction/types';
import { type WalletTransactionType } from '../Plugins/Transaction/types';
import { ProcessErrorType } from '@core/utils/eth';
import { Address } from '@core/database/models/Address';
import { AssetType } from '../Plugins/ReactInject';
import { Signature } from '@core/database/models/Signature';
import { notNull } from '@core/utils/rxjs';

export interface TransactionSubjectValue {
  txHash: string;
  txRaw: string;
  tx: ITxEvm;
  address: Address;
  // TODO: change optional to required
  signature?: Signature;
  extraParams: Pick<WalletTransactionType, 'contractAddress'> & {
    to?: string;
    sendAt: Date;
    epochHeight?: string | null;
    errorType?: ProcessErrorType;
    err?: string;
    assetType?: AssetType;
  };
}

export const broadcastTransactionSubjectPush = new BehaviorSubject<TransactionSubjectValue | null>(null);

export const broadcastTransactionSubject = broadcastTransactionSubjectPush.pipe(filter(notNull));
