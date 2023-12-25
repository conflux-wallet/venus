import React, { useState } from 'react';
import { View, SafeAreaView, Pressable } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Text, useTheme, Tab, TabView, Card } from '@rneui/themed';
import { statusBarHeight } from '@utils/deviceInfo';
import { type StackNavigation, ReceiveAddressStackName, ReceiveStackName } from '@router/configs';
import TokenList from '@modules/AssetList/TokenList';
import ESpaceNFTList from '@modules/AssetList/ESpaceNFTList';
import ActivityList from '@modules/ActivityList';
import Skeleton from '@components/Skeleton';
import { useCurrentAccount, useCurrentNetwork, useAssetsTotalPriceValue } from '@core/WalletCore/Plugins/ReactInject';
import { CFX_ESPACE_MAINNET_CHAINID, CFX_ESPACE_TESTNET_CHAINID } from '@core/consts/network';
import plugins from '@core/WalletCore/Plugins';
import { updateNFTDetail } from '@modules/AssetList/ESpaceNFTList/fetch';
import SendIcon from '@assets/icons/send.svg';
import ReceiveIcon from '@assets/icons/receive.svg';
import BuyIcon from '@assets/icons/buy.svg';
import MoreIcon from '@assets/icons/more.svg';
import WifiOffIcon from '@assets/icons/wifi_off.svg';
import PullRefresh from '@components/PullRefresh';
import { numberWithCommas } from '@core/utils/balance';

const MainButton: React.FC<{ onPress?: VoidFunction; disabled?: boolean; label?: string; icon?: React.ReactElement; _testID?: string }> = ({
  onPress,
  disabled,
  label,
  icon,
  _testID,
}) => {
  const { theme } = useTheme();
  return (
    <Pressable testID={_testID} className="flex items-center" onPress={!disabled ? onPress : undefined}>
      <View
        className="flex justify-center items-center w-[48px] h-[48px] rounded-full"
        style={{ backgroundColor: disabled ? theme.colors.surfaceSecondary : theme.colors.surfaceBrand }}
      >
        {icon}
      </View>
      <Text className="mt-[8px] text-base font-medium" style={{ color: disabled ? theme.colors.textSecondary : theme.colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
};

const Wallet: React.FC<{ navigation: StackNavigation }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isConnected } = useNetInfo(); // init state is null
  const [tabIndex, setTabIndex] = useState(0);
  const currentAccount = useCurrentAccount();
  const currentNetwork = useCurrentNetwork();
  const totalPriceValue = useAssetsTotalPriceValue();

  const renderTabTitle = () => {
    if (currentNetwork && (currentNetwork.chainId === CFX_ESPACE_MAINNET_CHAINID || currentNetwork.chainId === CFX_ESPACE_TESTNET_CHAINID)) {
      return (
        <View className="px-[24px]">
          <Tab
            value={tabIndex}
            onChange={setTabIndex}
            style={{ gap: 11 }}
            indicatorStyle={{ backgroundColor: theme.colors.surfaceBrand, width: 60, marginLeft: tabIndex * 11 }}
          >
            <Tab.Item
              containerStyle={{ flex: 0, width: 60 }}
              buttonStyle={{ paddingHorizontal: 0 }}
              testID="tokenTab"
              title="Tokens"
              titleStyle={(active) => ({ color: active ? theme.colors.textBrand : theme.colors.textSecondary, paddingHorizontal: 0 })}
            />
            <Tab.Item
              containerStyle={{ flex: 0, width: 60 }}
              buttonStyle={{ paddingHorizontal: 0 }}
              testID="NFTTab"
              title="NFTs"
              titleStyle={(active) => ({ color: active ? theme.colors.textBrand : theme.colors.textSecondary, paddingHorizontal: 0 })}
            />
            <Tab.Item
              containerStyle={{ flex: 0, width: 60 }}
              buttonStyle={{ paddingHorizontal: 0 }}
              title="Activity"
              testID="activityTab"
              titleStyle={(active) => ({ color: active ? theme.colors.textBrand : theme.colors.textSecondary, paddingHorizontal: 0 })}
            />
          </Tab>
        </View>
      );
    }
    return (
      <View className="px-[24px]">
        <Tab
          value={tabIndex}
          onChange={setTabIndex}
          style={{ gap: 11 }}
          indicatorStyle={{ backgroundColor: theme.colors.surfaceBrand, width: 60, marginLeft: tabIndex * 11 }}
        >
          <Tab.Item
            containerStyle={{ flex: 0, width: 60 }}
            buttonStyle={{ paddingHorizontal: 0 }}
            title="Tokens"
            testID="tokenTab"
            titleStyle={(active) => ({ color: active ? theme.colors.textBrand : theme.colors.textSecondary, paddingHorizontal: 0 })}
          />
          <Tab.Item
            containerStyle={{ flex: 0, width: 60 }}
            buttonStyle={{ paddingHorizontal: 0 }}
            title="Activity"
            testID="activityTab"
            titleStyle={(active) => ({ color: active ? theme.colors.textBrand : theme.colors.textSecondary, paddingHorizontal: 0 })}
          />
        </Tab>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 flex flex-col justify-start" style={{ backgroundColor: theme.colors.normalBackground, paddingTop: statusBarHeight + 48 }}>
      <View className="absolute left-0 right-0 flex justify-center items-center z-50" style={{ top: statusBarHeight + 48 }}>
        {isConnected !== null && !isConnected && (
          <View style={{ backgroundColor: theme.colors.textSecondary }} className="rounded-lg p-3 flex flex-row items-center">
            <WifiOffIcon color={theme.colors.textInvert} width={20} height={20} />
            <Text className="ml-1" style={{ color: theme.colors.textInvert }}>
              No Internet Connection
            </Text>
          </View>
        )}
      </View>
      <PullRefresh
        onRefresh={(close) => {
          updateNFTDetail();
          plugins.AssetsTracker.updateCurrentTracker()
            .catch((err) => console.log(err))
            .finally(() => close());
        }}
      >
        <View className="px-[24px]">
          <Text className="mt-[16px] leading-tight text-[16px] text-center" style={{ color: theme.colors.textSecondary }}>
            {currentAccount?.nickname}
          </Text>

          <View className="flex items-center justify-center h-[60px] mb-[16px]">
            {totalPriceValue === null ? (
              <Skeleton width={156} height={30} />
            ) : (
              <Text
                className=" leading-tight text-[48px] text-center font-bold"
                style={{ color: Number(totalPriceValue) === 0 ? theme.colors.textSecondary : theme.colors.textPrimary }}
              >
                ${numberWithCommas(totalPriceValue)}
              </Text>
            )}
          </View>

          <View className="flex flex-row justify-between">
            <MainButton
              _testID="send"
              onPress={() => navigation.navigate(ReceiveAddressStackName, {})}
              icon={<SendIcon color="#fff" width={24} height={24} />}
              label="Send"
            />
            <MainButton
              _testID="receive"
              onPress={() => navigation.navigate(ReceiveStackName)}
              icon={<ReceiveIcon color="#fff" width={24} height={24} />}
              label="Receive"
            />
            <MainButton _testID="buy" icon={<BuyIcon color="#fff" width={24} height={24} />} label="Buy" disabled />
            <MainButton _testID="more" icon={<MoreIcon color="#fff" width={24} height={24} />} label="More" disabled />
          </View>
        </View>
      </PullRefresh>
      {renderTabTitle()}
      <Card.Divider className="mb-[0px]" />
      <TabView tabItemContainerStyle={{ padding: 0 }} value={tabIndex} onChange={setTabIndex} animationType="spring">
        <TabView.Item style={{ width: '100%' }}>
          <TokenList enableEmpty />
        </TabView.Item>
        <TabView.Item style={{ width: '100%' }}>
          <ESpaceNFTList />
        </TabView.Item>
        <TabView.Item style={{ width: '100%' }}>
          <ActivityList />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

export default Wallet;
