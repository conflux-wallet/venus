import { Q } from '@nozbe/watermelondb';
import { map, mergeMap } from 'rxjs';
import { type Vault } from './';
import database from '../../';
import TableName from '../../TableName';
import { createModel, type ModelFields } from '../../helper/modelHelper';
import { createAccountGroup } from '../AccountGroup/service';
import { createAccount } from '../Account/service';
import { generateMnemonic } from '../../../utils/hdkey';
import { cryptoTool } from '../../helper/cryptoTool';
import { convertToCamelCase } from '../../react';

type Params = Omit<ModelFields<Vault>, 'isGroup'>;
function createVault(params: Params, prepareCreate: true): Vault;
function createVault(params: Params): Promise<Vault>;
function createVault(params: Params, prepareCreate?: true) {
  return createModel<Vault>({
    name: TableName.Vault,
    params,
    prepareCreate,
  });
}

const checkIsFirstVault = async () => {
  const count = await database.get(TableName.Vault).query().fetchCount();
  return count === 0;
};

const getVaultTypeCount = (type: Vault['type']) => database.get(TableName.Vault).query(Q.where('type', type)).fetchCount();
const defaultGroupNameMap = {
  hierarchical_deterministic: 'Seed Phrase',
  private_key: 'Private Key',
  BSIM: 'BSIM',
  hardware: 'Hardware',
  public_address: 'Public Address',
} as const;

async function createVaultOfType(params: { type: 'hierarchical_deterministic'; mnemonic: string }): Promise<void>;
async function createVaultOfType(params: { type: 'private_key'; privateKey: string }): Promise<void>;
async function createVaultOfType(params: { type: 'BSIM'; index: string; hexAddress: string }): Promise<void>;
async function createVaultOfType(params: { type: 'hardware'; index: string; hexAddress: string }): Promise<void>;
async function createVaultOfType(params: { type: 'public_address'; hexAddress: string }): Promise<void>;
async function createVaultOfType({
  type,
  mnemonic,
  privateKey,
  index,
  hexAddress,
}: {
  type: Vault['type'];
  mnemonic?: string;
  privateKey?: string;
  index?: string;
  hexAddress?: string;
}) {
  try {
    const data =
      type === 'private_key'
        ? await cryptoTool.encrypt(privateKey)
        : type === 'hierarchical_deterministic'
        ? await cryptoTool.encrypt(mnemonic)
        : type === 'BSIM'
        ? index
        : type === 'public_address'
        ? hexAddress
        : index;
    if (!data) throw new Error('Vault data is empty');
    const isFirstVault = await checkIsFirstVault();
    const count = await getVaultTypeCount(type);
    const vault = await createVault({ data, type, device: 'ePayWallet' });
    const accountGroup = await createAccountGroup({ nickname: `${defaultGroupNameMap[type]} - ${count + 1}`, hidden: false, vault });

    await createAccount({
      nickname: `${type === 'hierarchical_deterministic' || type === 'BSIM' ? '' : `${convertToCamelCase(type)} `}Account - 1`,
      hidden: false,
      selected: isFirstVault ? true : false,
      accountGroup,
      ...(hexAddress ? { hexAddress } : null),
    });
  } catch (error) {
    console.error('create vault error: ', error);
  }
}

export const createHDVault = async (importMnemonic?: string) => {
  try {
    const start = performance.now();
    console.log('create hd vault start');
    const mnemonic = importMnemonic ?? (await generateMnemonic());
    await createVaultOfType({ type: 'hierarchical_deterministic', mnemonic });
    const end = performance.now();
    console.log(`create hd vault took ${end - start} ms.`);
  } catch (error) {
    console.error('create hd vault error: ', error);
  }
};

export const createBSIMVault = async (args: { hexAddress: string; index: string }) => {
  try {
    const start = performance.now();
    console.log('create BSIM vault start');
    const { hexAddress, index } = args;
    await createVaultOfType({ type: 'BSIM', hexAddress, index });
    const end = performance.now();
    console.log(`create BSIM vault a Wallet took ${end - start} ms.`);
  } catch (error) {
    console.error('create BSIM vault error: ', error);
  }
};

export const createPrivateKeyVault = async (privateKey: string) => {
  try {
    const start = performance.now();
    console.log('create privateKey vault start');
    await createVaultOfType({ type: 'private_key', privateKey });
    const end = performance.now();
    console.log(`create privateKey vault a Wallet took ${end - start} ms.`);
  } catch (error) {
    console.error('create privateKey vault error: ', error);
  }
};

export const createPublicAddressVault = async (hexAddress: string) => {
  try {
    const start = performance.now();
    console.log('create publicAddress vault start');
    await createVaultOfType({ type: 'public_address', hexAddress });
    const end = performance.now();
    console.log(`create publicAddress vault a Wallet took ${end - start} ms.`);
  } catch (error) {
    console.error('create publicAddress vault error: ', error);
  }
};

export const checkVaultHasWallet = async (type: 'privatekey' | 'seedPhrase', secret: string) => {
  const vault = await database
    .get<Vault>(TableName.Vault)
    .query(Q.where('type', type === 'seedPhrase' ? 'hierarchical_deterministic' : 'private_key'))
    .fetch();

  for (let i = 0; i < vault.length; i++) {
    const vaultSecret = await vault[i].getData();
    if (secret === vaultSecret) return true;
  }
};
