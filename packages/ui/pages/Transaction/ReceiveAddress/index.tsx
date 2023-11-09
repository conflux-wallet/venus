import { Text, useTheme } from '@rneui/themed';
import { statusBarHeight } from '@utils/deviceInfo';
import { SafeAreaView, View, KeyboardAvoidingView } from 'react-native';
import { TextInput } from 'react-native';
import { BaseButton } from '@components/Button';
import { type StackNavigation, TokenListStackName } from '@router/configs';
import Flip from '@assets/icons/flip.svg';

export const ReceiveAddressStackName = 'ReceiveAddress';

export const SendPageHeaderOptions = ({ title = 'Send To' }: { title?: string }) =>
  ({
    headerTitle: title,
    headerTitleAlign: 'center',
  } as const);

const SendReceiver: React.FC<{ navigation: StackNavigation }> = ({ navigation }) => {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      className="flex-1 flex flex-col justify-start px-[24px] pb-7"
      style={{ backgroundColor: theme.colors.normalBackground, paddingTop: statusBarHeight + 48 }}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="mt-[13px]">
          <Text className="leading-6 ml-4 my-2">Receiver</Text>
          <View style={{ backgroundColor: theme.colors.surfaceCard }} className="flex flex-row items-center rounded-md px-4 py-2">
            <TextInput
              className="flex-1 leading-6"
              keyboardType={'numeric'}
              placeholder="Enter an address or domain name"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Flip width={20} height={20} />
          </View>
        </View>
        <View className="mt-auto mb-6">
          <BaseButton onPress={() => navigation.navigate(TokenListStackName)}>Next</BaseButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SendReceiver;
