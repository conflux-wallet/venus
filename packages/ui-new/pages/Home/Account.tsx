import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCurrentAccount, useCurrentAddressValueOfAccount, useVaultOfAccount, VaultType } from '@core/WalletCore/Plugins/ReactInject';
import Text from '@components/Text';
import useForceUpdateOnFocus from '@hooks/useUpdateOnFocus';
import { HomeStackName, type StackScreenProps } from '@router/configs';
import { toDataUrl } from '@utils/blockies';
import BSIMCardWallet from '@assets/icons/wallet-bsim.webp';
import HDWallet from '@assets/icons/wallet-hd.webp';
import ExistWallet from '@assets/icons/wallet-Imported.webp';
import ArrowLeft from '@assets/icons/arrow-left.svg';

const Account: React.FC<{ onPress: () => void; navigation: StackScreenProps<typeof HomeStackName>['navigation'] }> = ({ navigation, onPress }) => {
  const { colors } = useTheme();
  const account = useCurrentAccount();
  const addressValue = useCurrentAddressValueOfAccount(account?.id);
  const vault = useVaultOfAccount(account?.id);
  useForceUpdateOnFocus(navigation);

  return (
    <Pressable
      style={({ pressed }) => [styles.accountContainer, { borderColor: colors.borderThird, backgroundColor: pressed ? colors.underlay : 'transparent' }]}
      onPress={onPress}
      testID='account'
    >
      <View style={styles.accountImageWrapper}>
        <Image style={styles.accountImage} source={{ uri: toDataUrl(addressValue) }} />
        <Image
          style={styles.acccountImageBSIMCard}
          source={vault?.type === VaultType.BSIM ? BSIMCardWallet : vault?.type === VaultType.HierarchicalDeterministic ? HDWallet : ExistWallet}
        />
      </View>
      <Text style={[styles.accountText, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="middle">
        {account?.nickname ?? 'Loading...'}
      </Text>
      <ArrowLeft style={styles.accountArrow} color={colors.iconPrimary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  accountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountImageWrapper: {
    position: 'relative',
    width: 24,
    height: 24,
    marginRight: 11,
  },
  accountImage: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
  acccountImageBSIMCard: {
    position: 'absolute',
    width: 20,
    height: 20,
    right: -7,
    bottom: -3,
  },
  accountText: {
    maxWidth: 132,
    fontSize: 14,
    fontWeight: '300',
  },
  accountArrow: {
    marginLeft: 9.5,
    transform: [{ rotate: '-90deg' }, { translateX: -3 }],
  },
});

export default Account;
