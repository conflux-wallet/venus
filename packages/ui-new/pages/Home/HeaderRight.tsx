import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCurrentNetwork } from '@core/WalletCore/Plugins/ReactInject';
import Text from '@components/Text';
import { HomeStackName, SettingsStackName, type StackScreenProps } from '@router/configs';
import ESpaceMainnet from '@assets/chains/eSpace-mainnet.svg';
import QrCode from '@assets/icons/qr-code.svg';
import Settings from '@assets/icons/settings.svg';

const NetworkSelector: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { colors } = useTheme();
};

const Network: React.FC = () => {
  const { colors } = useTheme();
  const currentNetwork = useCurrentNetwork();
  const showName = useMemo(() => {
    if (!currentNetwork?.name) return '';
    const split = currentNetwork.name.split(' ');
    return split.length > 1 ? split[1] : split[0];
  }, [currentNetwork?.name]);

  if (!currentNetwork) return null;
  if (currentNetwork.netId === 1030) return <ESpaceMainnet />;
  return <Text style={[styles.networkText, { color: colors.textPrimary }]}>{showName}</Text>;
};

const HeaderRight: React.FC<{ navigation: StackScreenProps<typeof HomeStackName>['navigation'] }> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.wrapper,
          styles.wrapperLeft,
          { borderColor: colors.borderThird, backgroundColor: pressed ? colors.underlay : 'transparent' },
        ]}
      >
        <Network />
      </Pressable>
      <Pressable style={({ pressed }) => [styles.wrapper, { borderColor: colors.borderThird, backgroundColor: pressed ? colors.underlay : 'transparent' }]}>
        <QrCode />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.wrapper,
          styles.wrapperRight,
          { borderColor: colors.borderThird, backgroundColor: pressed ? colors.underlay : 'transparent' },
        ]}
        onPress={() => navigation.navigate(SettingsStackName)}
      >
        <Settings />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
  },
  wrapperLeft: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  wrapperRight: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  networkText: {
    fontSize: 8,
    fontWeight: '300',
  },
});

export default HeaderRight;
