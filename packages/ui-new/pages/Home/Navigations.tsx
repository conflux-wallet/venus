import React, { type ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Button from '@components/Button';
import Text from '@components/Text';
import { HomeStackName, SendTransactionStackName, SendTransactionStep1StackName, ReceiveStackName, type StackScreenProps } from '@router/configs';
import ArrowUpward from '@assets/icons/arrow-upward.svg';
import ArrowDownward from '@assets/icons/arrow-downward.svg';
import Buy from '@assets/icons/buy.svg';
import More from '@assets/icons/more.svg';

export const Navigation: React.FC<{ title: string; Icon: ComponentProps<typeof Button>['Icon']; onPress?: VoidFunction }> = ({ title, Icon, onPress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.navigation}>
      <Button square size="small" Icon={Icon} onPress={onPress} />
      <Text style={[styles.navigationText, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
};

const Navigations: React.FC<{ navigation: StackScreenProps<typeof HomeStackName>['navigation'] }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Navigation title="Send" Icon={ArrowUpward} onPress={() => navigation.navigate(SendTransactionStackName, { screen: SendTransactionStep1StackName })} />
      <Navigation title="Receive" Icon={ArrowDownward} onPress={() => navigation.navigate(ReceiveStackName)} />
      <Navigation title="Buy" Icon={Buy} />
      <Navigation title="More" Icon={More} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navigation: {
    flex: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  navigationText: {
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 20,
  },
});

export default Navigations;
