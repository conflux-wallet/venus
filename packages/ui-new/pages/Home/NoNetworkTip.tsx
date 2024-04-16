import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import Text from '@components/Text';
import NoNetwork from '@assets/icons/no-network.svg';

const NoNetworkTip: React.FC = () => {
  const { reverseColors } = useTheme();
  const { t } = useTranslation();

  const netInfo = useNetInfo();

  if (netInfo.isConnected || netInfo.isConnected === null) return null;
  return (
    <View style={[styles.container, { backgroundColor: reverseColors.bgPrimary }]}>
      <NoNetwork style={styles.icon} color={reverseColors.iconPrimary} />
      <Text style={[styles.text, { color: reverseColors.textPrimary }]}>{t('home.noNetwork')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 224,
    height: 40,
    paddingHorizontal: 24,
    borderRadius: 6,
    bottom: 100,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginRight: 6,
    transform: [{ translateY: 1.5 }],
  },
});

export default NoNetworkTip;
