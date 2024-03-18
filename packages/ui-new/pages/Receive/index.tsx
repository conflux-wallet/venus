import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTheme, StackActions } from '@react-navigation/native';
import { View, Linking, StyleSheet } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useCurrentAccount, useCurrentNetwork, useCurrentAddressValue, NetworkType } from '@core/WalletCore/Plugins/ReactInject';
import { type AssetInfo } from '@core/WalletCore/Plugins/AssetsTracker/types';
import methods from '@core/WalletCore/Methods';
import plugins from '@core/WalletCore/Plugins';
import { ReceiveStackName, type StackScreenProps } from '@router/configs';
import { AccountItemView } from '@modules/AccountsList';
import BottomSheet, { snapPoints, BottomSheetScrollView, type BottomSheetMethods } from '@components/BottomSheet';
import Text from '@components/Text';
import Button from '@components/Button';
import { Navigation } from '@pages/Home/Navigations';
import { encodeETHURL } from '@utils/ETHURL';
import Logo from '@assets/icons/logo.png';
import Share from '@assets/icons/share.svg';
import PoundKey from '@assets/icons/pound-key.svg';
import ReceiveSetAsset from './ReceiveSetAsset';

interface Props {
  navigation: StackScreenProps<typeof ReceiveStackName>['navigation'];
}

const Receive: React.FC<Props> = ({ navigation }) => {
  const { colors, mode } = useTheme();
  const bottomSheetRef = useRef<BottomSheetMethods>(null!);
  const setAssetRef = useRef<BottomSheetMethods>(null!);

  const currentAccount = useCurrentAccount()!;
  const currentNetwork = useCurrentNetwork()!;
  const currentAddressValue = useCurrentAddressValue()!;

  const [selectAsset, setSelectAsset] = useState<AssetInfo | null>(null);
  const ethUrl = useMemo(
    () => encodeETHURL({ target_address: currentAddressValue, schema_prefix: currentNetwork.networkType === NetworkType.Conflux ? 'conflux' : 'ethereum' }),
    [],
  );

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints.large} index={0} isModal={false} onClose={() => navigation.goBack()}>
        <BottomSheetScrollView style={styles.container}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Receive</Text>
          <Text style={[styles.tip, { color: colors.textPrimary }]}>Only send {currentNetwork?.name} network assets to this address.</Text>

          <View style={[styles.qrcodeWrapper, { backgroundColor: colors.bgSecondary }]}>
            <QRCode value={ethUrl} size={220} logo={Logo} logoSize={60} logoBackgroundColor="transparent" />
          </View>

          <View style={styles.accountWrapper}>
            <AccountItemView nickname={currentAccount?.nickname} addressValue={currentAddressValue} colors={colors} mode={mode} shorten={false} />
          </View>

          <View style={styles.btnWrapper}>
            <Navigation
              title="Share"
              Icon={Share}
              onPress={() => {
                Clipboard.setString(currentAddressValue ?? '');
                showMessage({
                  message: 'Copied!',
                  type: 'success',
                  duration: 1500,
                  width: 160,
                });
              }}
            />
            <Navigation title="Set amount" Icon={PoundKey} onPress={() => setAssetRef.current?.present()} />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
      <ReceiveSetAsset bottomSheetRef={setAssetRef} onConfirm={({ asset }) => setSelectAsset(asset)} />
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  tip: {
    alignSelf: 'center',
    marginBottom: 16,
    width: 280,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  qrcodeWrapper: {
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 280,
    height: 280,
    borderRadius: 8,
  },
  accountWrapper: {
    alignSelf: 'center',
    marginTop: 24,
    width: 280,
  },
  btnWrapper: {
    marginTop: 102,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 38,
  },
});

export default Receive;
