import database from '../Database';
import Encrypt from './encrypt';
import {ABI_777, ABI_721, ABI_1155} from '../Consts/tokenAbi';
import {Interface} from '@ethersproject/abi';

const encrypt = new Encrypt();

export const iface777 = new Interface(ABI_777);
export const iface721 = new Interface(ABI_721);
export const iface1155 = new Interface(ABI_1155);
export const camelCase = str => {
  return str.replace(/_([a-z])/g, function (match, group1) {
    return group1.toUpperCase();
  });
};

export const validateDuplicateVault = async (password, data) => {
  const records = await database.get('vault').query().fetch();
  let ret = false;
  if (records.length) {
    for (let i = 0; i < records.length; i++) {
      let {data: decryptData} = await encrypt.decrypt(
        password,
        records[i].data,
      );
      if (decryptData === data) {
        ret = true;
        break;
      }
    }
  }
  return ret;
};

export const isHexAddress = address => /^0x[0-9a-fA-F]{40}$/.test(address);

export const enrichFetch = ({url, params, method = 'POST'}) => {
  const options = {
    method,
    timeout: 6000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (params) {
    options.body = JSON.stringify({
      ...params,
    });
  }
  return fetch(url, {...options})
    .then(r => r.json())
    .then(r => r.result);
};
