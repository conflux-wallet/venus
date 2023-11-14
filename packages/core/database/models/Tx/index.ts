import { Model, type Relation } from '@nozbe/watermelondb';
import { field, text, readonly, date, immutableRelation } from '@nozbe/watermelondb/decorators';
import { type Address } from '../Address';
import { type Token } from '../Token';
import { type TxExtra } from '../TxExtra';
import { type TxPayload } from '../TxPayload';
import TableName from '../../TableName';

export class Tx extends Model {
  static table = TableName.Tx;
  static associations = {
    [TableName.Token]: { type: 'belongs_to', key: 'token_id' },
    [TableName.Address]: { type: 'belongs_to', key: 'address_id' },
    [TableName.TxExtra]: { type: 'belongs_to', key: 'tx_extra_id' },
    [TableName.TxPayload]: { type: 'belongs_to', key: 'tx_payload_id' },
  } as const;

  @text('raw') raw!: string;
  @text('hash') hash!: string;
  @field('status') status!: number;
  @text('receipt') receipt!: string | null;
  @field('block_number') blockNumber!: number | null;
  @text('block_hash') blockHash!: string | null;
  @field('chain_switched') chainSwitched!: boolean | null;
  @readonly @date('created_at') createdAt!: Date;
  @date('pending_at') pendingAt!: number | null;
  @text('err') err!: string | null;
  @field('from_fluent') fromFluent!: boolean | null;
  @field('from_scan') fromScan!: boolean | null;
  @date('resend_at') resendAt!: number | null;
  @immutableRelation(TableName.Token, 'token_id') token!: Relation<Token> | null;
  @immutableRelation(TableName.Address, 'address_id') address!: Relation<Address>;
  @immutableRelation(TableName.TxExtra, 'tx_extra_id') txExtra!: Relation<TxExtra>;
  @immutableRelation(TableName.TxPayload, 'tx_payload_id') txPayload!: Relation<TxPayload>;
}