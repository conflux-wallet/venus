import Vault from './Vault';
import Token20 from './Token20';
import initDatabase from './Controller/initDatabase';
import {getNetworks, getAccountGroups} from './Query';
import Balance from './Balance';
import {CFX_TESTNET_RPC_ENDPOINT} from './Consts/network';
// 初始化数据库
initDatabase();
/* *************************************************************** */
// 导入助记词/私
const importAccount = async () => {
  const networks = await getNetworks();
  const accountGroups = await getAccountGroups();
  const vault = new Vault({
    password: '2222aaa',
    mnemonic: '',
    networks,
    accountGroups,
  });
  vault.addVault();
};

// importAccount();
/* *************************************************************** */
// 把tokenList 的token 添加到数据库里
const token20 = new Token20();
// token20.initTokenToCurrentNetwork();
/* *************************************************************** */

// get native balance
// const balance = new Balance(CFX_TESTNET_RPC_ENDPOINT, 'cfx');
// balance.getBalance('cfxtest:aamx6vj8avtza17s92tsd5sr77mvtw7rparkba6px2');
