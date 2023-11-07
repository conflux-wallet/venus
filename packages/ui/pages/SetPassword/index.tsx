import { View, SafeAreaView } from 'react-native';
import { statusBarHeight } from '@utils/deviceInfo';
import { Text, useTheme, CheckBox } from '@rneui/themed';
import Password from '@components/PasswordInput';
import { useState } from 'react';
import CreatePasswordAlert from './components/Alert';
import { type NavigationProp, type RouteProp, useRoute } from '@react-navigation/native';
import { AuthenticationType, authentication } from '@DB/helper';
import { type RootStackList, WalletStackName, HomeStackName } from '@router/configs';
import createVaultWithRouterParams from './createVaultWithRouterParams';
import useInAsync from '@hooks/useInAsync';
import { CommonActions } from '@react-navigation/native';
import { BaseButton } from '@components/Button';

export const SetPasswordStackName = 'SetPassword';

const SetPassword: React.FC<{ navigation: NavigationProp<RootStackList> }> = (props) => {
  const { navigation } = props;
  const route = useRoute<RouteProp<RootStackList, typeof SetPasswordStackName>>();
  const { theme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState({ pwd: '', error: '' });
  const [confirmPwd, setConfirmPwd] = useState('');
  const { inAsync: loading, execAsync: createVault } = useInAsync(createVaultWithRouterParams);
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: 'You’ve successfully protected wallet. Remember to keep your Password, it’s your responsibility!',
  });

  const handleSetPassword = (value: string) => {
    setPassword({ pwd: value, error: value.length < 8 && value !== '' ? 'Password must be at least 8 characters' : '' });
  };

  const handleConfirmPassword = (value: string) => {
    setConfirmPwd(value);
  };

  const handleCreatePassword = async () => {
    try {
      await authentication.setPassword({ password: confirmPwd, authType: AuthenticationType.Password });
      await createVault(route.params);
      setAlert({ show: true, type: 'success', message: 'You’ve successfully protected wallet. Remember to keep your Password, it’s your responsibility!' });
    } catch (e) {
      setAlert({ show: false, type: 'error', message: `${e}` });
    }
  };

  return (
    <SafeAreaView
      className="flex flex-1 flex-col justify-start px-[24px] pb-[56px]"
      style={{ backgroundColor: theme.colors.normalBackground, paddingTop: statusBarHeight + 48 }}
    >
      <View>
        <Text className="text-center text-[36px] font-bold leading-tight" style={{ color: theme.colors.textBrand }}>
          Set Password
        </Text>
        <Text className="text-center text-[16px]">Add security verification to ensure the safety of your funds.</Text>
      </View>

      <View>
        <Password
          helperText="Must be at least 8 characters"
          errorMessage={password.error}
          value={password.pwd}
          onChangeText={handleSetPassword}
          title="New Password"
        />

        <Password
          helperText="Password must be match"
          errorMessage={confirmPwd !== password.pwd && confirmPwd !== '' ? 'Passwords do not match' : ''}
          value={confirmPwd}
          onChangeText={handleConfirmPassword}
          title="Confirm New Password"
        />
      </View>

      <View className="mt-auto flex flex-row items-center mb-[15px]">
        <CheckBox
          containerStyle={{ backgroundColor: 'transparent', padding: 0 }}
          checked={checked}
          onPress={() => setChecked(!checked)}
          iconType="material-community"
          checkedIcon="checkbox-marked"
          uncheckedIcon="checkbox-blank-outline"
          checkedColor={theme.colors.textBrand}
          uncheckedColor={theme.colors.textBrand}
        />
        <Text className="text-base">ePay Wallet does not store your password. Please remember your password.</Text>
      </View>
      <BaseButton
        loading={loading}
        onPress={handleCreatePassword}
        disabled={!(checked && password.pwd !== '' && password.pwd === confirmPwd && password.error === '')}
      >
        Create Password
      </BaseButton>

      <CreatePasswordAlert
        {...alert}
        onOk={() => {
          setAlert({ show: false, type: '', message: '' });
          navigation.navigate(HomeStackName, { screen: WalletStackName });
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: HomeStackName }] }));
        }}
      />
    </SafeAreaView>
  );
};

export default SetPassword;
