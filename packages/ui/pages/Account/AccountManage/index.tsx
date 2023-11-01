import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, Text, TouchableHighlight, Pressable } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useHeaderHeight } from '@react-navigation/elements';
import { Button } from '@rneui/base';
import { useTheme, Dialog, ListItem } from '@rneui/themed';
import { withObservablesFromDB } from '@DB/react';
import { type AccountGroup } from '@DB/models/AccountGroup';
import { clearAccountData } from '@DB/setup';
import { statusBarHeight } from '@utils/deviceInfo';
import { AddAccountStackName, WelcomeStackName, GroupSettingStackName, type StackNavigation } from '@router/configs';

import AccountGroupItem from '../AccountGroupItem';

export const AccountManageStackName = 'AccountManage';

const AccountManage: React.FC<{ navigation: StackNavigation; accountGroup: Array<AccountGroup> }> = ({ navigation, accountGroup: accountGroups }) => {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const [visibleClearAccount, setVisibleClearAccount] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 flex flex-col justify-start pb-[24px]"
      style={{ backgroundColor: theme.colors.surfacePrimary, paddingTop: headerHeight + 8 }}
    >
      <View className="mb-[16px] px-[24px] flex flex-row justify-between items-center">
        <Text className="text-[16px] leading-tight" style={{ color: theme.colors.textPrimary }}>
          Wallets
        </Text>

        <Button
          titleStyle={{ fontSize: 16, fontWeight: '500', color: theme.colors.surfaceBrand }}
          size="sm"
          type="clear"
          title="Add another wallet"
          onPress={() => navigation.navigate(AddAccountStackName, { type: 'add' })}
        />
      </View>

      <ScrollView className="flex-1 px-[24px]">
        {accountGroups?.map((accountGroup, index) => (
          <TouchableHighlight
            underlayColor={theme.colors.underlayColor}
            style={{ marginTop: index === 0 ? 0 : 16, borderRadius: 8, overflow: 'hidden' }}
            key={accountGroup.id}
            onPress={() => navigation.navigate(GroupSettingStackName, { accountGroupId: accountGroup.id })}
          >
            <AccountGroupItem accountGroup={accountGroup} enableAddNew />
          </TouchableHighlight>
        ))}
      </ScrollView>

      <View className="mt-[16px] px-[24px]">
        <TouchableHighlight className="rounded-[8px] overflow-hidden" onPress={() => setVisibleClearAccount(true)}>
          <ListItem containerStyle={{ backgroundColor: theme.colors.surfaceCard }}>
            <ListItem.Content className="flex flex-row justify-center">
              <ListItem.Title style={{ color: theme.colors.error, textAlign: 'center' }} className="font-bold">
                Erase all wallets
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </TouchableHighlight>
      </View>
      <Dialog isVisible={visibleClearAccount} onBackdropPress={() => setVisibleClearAccount(false)}>
        <Dialog.Title title="Confirm clear account data?" titleStyle={{ color: theme.colors.textPrimary, fontSize: 22, fontWeight: 'bold' }} />
        <Text style={{ color: theme.colors.textSecondary }} className="text-[16px]">
          Account data will be cleared, but network settings and other configurations will remain.
        </Text>
        <Dialog.Actions>
          <Dialog.Button
            title="Confirm"
            onPress={async () => {
              try {
                await clearAccountData();
                showMessage({
                  message: 'Clear account data successfully',
                  type: 'success',
                  duration: 1500,
                  statusBarHeight,
                });
                navigation.navigate(WelcomeStackName);
              } catch (err) {
                await clearAccountData();
                showMessage({
                  message: 'Clear account data failed',
                  description: String(err ?? ''),
                  type: 'warning',
                  duration: 2000,
                  statusBarHeight,
                });
              } finally {
                setVisibleClearAccount(false);
              }
            }}
          />
          <Dialog.Button title="Cancel" onPress={() => setVisibleClearAccount(false)} />
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
};

export default withObservablesFromDB(['accountGroup'])(AccountManage);