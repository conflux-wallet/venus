import ProhibitIcon from '@assets/icons/prohibit.svg';
import { type BottomSheetMethods, BottomSheetScrollView } from '@components/BottomSheet';
import HourglassLoading from '@components/Loading/Hourglass';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import methods from '@core/WalletCore/Methods';
import plugins from '@core/WalletCore/Plugins';
import { fetchERC20AssetInfoBatchWithAccount } from '@core/WalletCore/Plugins/AssetsTracker/fetchers/basic';
import type { AssetInfo } from '@core/WalletCore/Plugins/AssetsTracker/types';
import type { NFTItemDetail } from '@core/WalletCore/Plugins/NFTDetailTracker';
import {
  AssetSource,
  AssetType,
  useAssetsAllList,
  useCurrentAddress,
  useCurrentAddressValue,
  useCurrentNetwork,
  useCurrentOpenNFTDetail,
  useTokenListOfCurrentNetwork,
} from '@core/WalletCore/Plugins/ReactInject';
import NFTItem from '@modules/AssetsList/NFTsList/NFTItem';
import TokenItem from '@modules/AssetsList/TokensList/TokenItem';
import { type Tab, Tabs, TabsContent, setSelectAssetScrollY } from '@modules/AssetsTabs';
import { useTheme } from '@react-navigation/native';
import {
  type SendTransactionScreenProps,
  type SendTransactionStep2StackName,
  SendTransactionStep3StackName,
  SendTransactionStep4StackName,
} from '@router/configs';
import { debounce, escapeRegExp } from 'lodash-es';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { type NativeScrollEvent, type NativeSyntheticEvent, Pressable, StyleSheet } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import type PagerView from 'react-native-pager-view';
import SendTransactionBottomSheet from '../SendTransactionBottomSheet';

interface Props {
  navigation?: SendTransactionScreenProps<typeof SendTransactionStep2StackName>['navigation'];
  route?: SendTransactionScreenProps<typeof SendTransactionStep2StackName>['route'];
  onConfirm?: (asset: AssetInfo) => void;
  onClose?: () => void;
  selectType?: 'Send' | 'Receive';
}

const SendTransactionStep2Asset: React.FC<Props> = ({ navigation, route, onConfirm, onClose, selectType = 'Send' }) => {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheetMethods>(null!);
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<Tab>('Tokens');
  const pageViewRef = useRef<PagerView>(null);
  const handleScroll = useCallback((evt: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSelectAssetScrollY(evt.nativeEvent.contentOffset.y);
  }, []);
  useEffect(() => {
    return () => {
      setSelectAssetScrollY(0);
    };
  }, []);

  const currentNetwork = useCurrentNetwork()!;
  const currentAddress = useCurrentAddress();
  const currentAddressValue = useCurrentAddressValue();
  const currentOpenNFTDetail = useCurrentOpenNFTDetail();
  const assets = (selectType === 'Send' ? useAssetsAllList : useTokenListOfCurrentNetwork)();

  const [searchAsset, setSearchAsset] = useState(() => route?.params?.searchAddress ?? '');
  const [inFetchingRemote, setInFetchingRemote] = useState(false);
  const [filterAssets, setFilterAssets] = useState<{
    type: 'local' | 'remote' | 'invalid-format' | 'invalid-ERC20' | 'network-error';
    assets: Array<AssetInfo>;
  }>(() => ({ type: 'local', assets: [] }));

  const searchFilterAssets = useCallback(
    debounce(async (value: string) => {
      if (value) {
        plugins.NFTDetailTracker.setCurrentOpenNFT(undefined);
      }

      const localAssets = assets
        ?.filter((asset) =>
          [asset.name, asset.symbol, asset.type === AssetType.Native ? AssetType.Native : asset.contractAddress].some((str) =>
            !str ? false : str?.search(new RegExp(escapeRegExp(value), 'i')) !== -1,
          ),
        )
        .filter((asset) => !!asset.type)
        .filter((asset) => (onConfirm ? asset.type !== AssetType.ERC1155 && asset.type !== AssetType.ERC721 : true));
      if (localAssets && localAssets?.length > 0) {
        setFilterAssets({ type: 'local', assets: localAssets });
      } else {
        try {
          const isValidAddress = methods.checkIsValidAddress({
            networkType: currentNetwork.networkType,
            addressValue: value!,
          });

          if (isValidAddress) {
            setInFetchingRemote(true);
            await new Promise((resolve) => setTimeout(() => resolve(null!)));
            const remoteAsset = await fetchERC20AssetInfoBatchWithAccount({
              networkType: currentNetwork.networkType,
              endpoint: currentNetwork?.endpoint,
              contractAddress: value,
              accountAddress: currentAddress!,
            });
            const assetInfo = { ...remoteAsset, type: AssetType.ERC20, contractAddress: value };
            setFilterAssets({ type: 'remote', assets: [assetInfo] as Array<AssetInfo> });
            const isInDB = await currentNetwork.queryAssetByAddress(value);
            if (!isInDB) {
              await methods.createAsset({
                network: currentNetwork,
                ...assetInfo,
                source: AssetSource.Custom,
              });
            }
          } else {
            setFilterAssets({ type: 'invalid-format', assets: [] });
          }
        } catch (err) {
          if (String(err).includes('timed out')) {
            setFilterAssets({ type: 'network-error', assets: [] });
          } else {
            setFilterAssets({ type: 'invalid-ERC20', assets: [] });
          }
        } finally {
          setInFetchingRemote(false);
        }
      }
    }, 200),
    [assets, currentNetwork, currentAddressValue],
  );

  useEffect(() => {
    searchFilterAssets(searchAsset);
  }, [searchFilterAssets, searchAsset]);

  const handleClickAsset = useCallback((asset: AssetInfo, nftItemDetail?: NFTItemDetail) => {
    if (navigation) {
      if ((asset.type === AssetType.ERC20 || asset.type === AssetType.Native) && (Number(asset.balance) === 0 || isNaN(Number(asset.balance)))) {
        return showMessage({
          message: t('tx.asset.zeroBalance', { symbol: asset.symbol }),
          type: 'warning',
        });
      }
      if (asset.type === AssetType.ERC721) {
        navigation.navigate(SendTransactionStep4StackName, { ...route!.params, asset, nftItemDetail, amount: '1' });
      } else {
        navigation.navigate(SendTransactionStep3StackName, { ...route!.params, asset, nftItemDetail });
      }
    } else if (onConfirm) {
      onConfirm(asset);
      setSearchAsset('');
      bottomSheetRef?.current?.close();
    }
  }, []);

  return (
    <SendTransactionBottomSheet
      ref={bottomSheetRef}
      isRoute={!onConfirm}
      index={!onConfirm ? undefined : 0}
      onClose={onClose}
      showTitle={selectType === 'Receive' ? t('receive.title') : t('tx.send.title')}
    >
      <Text style={[styles.selectAsset, { color: colors.textSecondary }]}>{t('tx.asset.inputTitle')}</Text>
      <TextInput
        containerStyle={[
          styles.textinput,
          { borderColor: !!searchAsset && filterAssets?.type && filterAssets.type.startsWith('invalid') ? colors.down : colors.borderFourth },
        ]}
        showVisible={false}
        defaultHasValue={false}
        value={searchAsset}
        onChangeText={(newNickName) => setSearchAsset(newNickName?.trim())}
        isInBottomSheet
        placeholder={t('tx.asset.placeholder')}
        multiline
      />

      {!searchAsset && (
        <BottomSheetScrollView style={styles.scrollView} stickyHeaderIndices={[0]} onScroll={handleScroll}>
          <Tabs currentTab={currentTab} pageViewRef={pageViewRef} type="SelectAsset" onlyToken={!navigation} />
          <TabsContent
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            pageViewRef={pageViewRef}
            type="SelectAsset"
            selectType={selectType}
            onPressItem={handleClickAsset}
            onlyToken={!navigation}
          />
        </BottomSheetScrollView>
      )}
      {searchAsset && (
        <BottomSheetScrollView style={[styles.scrollView, { marginTop: 8 }]} onScroll={handleScroll}>
          {filterAssets.assets?.length > 0 &&
            filterAssets.assets.map((asset) => {
              const itemKey = asset.type === AssetType.Native ? AssetType.Native : asset.contractAddress;
              return asset.type === AssetType.ERC20 || asset.type === AssetType.Native ? (
                <TokenItem
                  key={itemKey}
                  data={asset}
                  showTypeLabel
                  onPress={handleClickAsset}
                  hidePrice={selectType === 'Receive'}
                  hideBalance={selectType === 'Receive'}
                  showAddress={selectType === 'Receive'}
                />
              ) : asset.type === AssetType.ERC1155 || asset.type === AssetType.ERC721 ? (
                <NFTItem
                  key={itemKey}
                  data={asset}
                  currentOpenNFTDetail={currentOpenNFTDetail}
                  tabsType="SelectAsset"
                  showTypeLabel
                  onPress={handleClickAsset}
                />
              ) : null;
            })}

          {filterAssets.type !== 'local' && filterAssets.type !== 'remote' && (
            <Pressable
              style={({ pressed }) => [styles.invalidWrapper, { backgroundColor: pressed ? colors.underlay : 'transparent' }]}
              disabled={filterAssets.type !== 'network-error'}
              testID="retry"
            >
              <ProhibitIcon style={styles.invalidIcon} width={24} height={24} />
              <Text style={[styles.invalidTip, { color: colors.down }]}>
                {filterAssets.type === 'invalid-format' && t('tx.asset.error.invalidFormat')}
                {filterAssets.type === 'invalid-ERC20' && t('tx.asset.error.invalidERC20')}
                {filterAssets.type === 'network-error' && (
                  <Trans i18nKey={'tx.asset.error.networkError'}>
                    Your Network is weak, <Text style={{ textDecorationLine: 'underline' }}>click to retry</Text>
                  </Trans>
                )}
              </Text>
            </Pressable>
          )}
          {inFetchingRemote && <HourglassLoading style={styles.fetchLoading} />}
        </BottomSheetScrollView>
      )}
    </SendTransactionBottomSheet>
  );
};

const styles = StyleSheet.create({
  selectAsset: {
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
    marginVertical: 16,
  },
  invalidWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 32,
  },
  invalidIcon: {
    marginRight: 4,
  },
  invalidTip: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 18,
  },
  fetchLoading: {
    marginTop: 24,
    width: 60,
    height: 60,
    alignSelf: 'center',
  },
  textinput: {
    marginHorizontal: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});

export default SendTransactionStep2Asset;
