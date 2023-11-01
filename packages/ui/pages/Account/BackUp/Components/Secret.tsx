import { BaseButton } from '@components/Button';
import { Vault } from '@core/DB/models/Vault';
import { Icon, Text, useTheme, Tooltip } from '@rneui/themed';
import clsx from 'clsx';
import { useState } from 'react';
import { View, useColorScheme } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';

const emptyString = '           ';

const Secret = ({ type, getSecretData }: { type: Vault['type']; getSecretData: () => Promise<string> }) => {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const [secret, setSecret] = useState(emptyString);
  const [isShow, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tooltipShow, setTooltipShow] = useState(false);

  const handleGetSecretData = async () => {
    try {
      setLoading(true);
      const data = await getSecretData();
      setShow(true);
      setSecret(data);
    } catch (error) {
      // do nothing
      console.log('get vault is error', error);
      setSecret(emptyString);
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    Clipboard.setString(secret);
    setTooltipShow(true);
  };

  return (
    <View>
      <View className="flex flex-wrap content-between px-4 py-4 rounded-lg h-[314px] relative last:mb-0" style={{ backgroundColor: theme.colors.surfaceCard }}>
        {type === 'hierarchical_deterministic' ? (
          secret.split(' ').map((value, index) => (
            <View
              key={index}
              style={{ backgroundColor: theme.colors.surfaceThird, width: '48%' }}
              className={clsx('px-4 py-2 rounded-full', { 'mb-2': (index + 1) % 6 !== 0 })}
            >
              <Text className="text-center text-base font-normal leading-6">
                {index + 1}. {value}
              </Text>
            </View>
          ))
        ) : (
          <View className="flex flex-1 w-full justify-center items-center">
            <QRCode value={secret} size={280} />
          </View>
        )}

        {!isShow && (
          <View
            className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center"
            style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(23, 23, 23, 1)' : 'rgba(255, 255, 255,1)' }}
          >
            <Text className="text-xl font-bold leading-tight">Tap to view the {type === 'hierarchical_deterministic' ? 'seed phrase' : 'private key'}</Text>
            <Text className="text-base font-normal leading-6">Make sure your environment is safe</Text>
            <View className="mt-4">
              <BaseButton loading={loading} buttonStyle={{ paddingHorizontal: 20, paddingVertical: 10 }} onPress={handleGetSecretData}>
                <Icon name="remove-red-eye" className="pr-1" />
                <Text className="text-sm font-normal leading-6">View</Text>
              </BaseButton>
            </View>
          </View>
        )}
      </View>
      {type === 'private_key' && isShow && (
        <View className="flex flex-row items-center mt-4 p-2" style={{ backgroundColor: theme.colors.surfaceCard }}>
          <Text className="shrink text-sm leading-5 font-normal" style={{ color: theme.colors.textSecondary }}>
            {secret}
          </Text>
          <Tooltip
            backgroundColor={theme.colors.surfaceCard}
            visible={tooltipShow}
            popover={
              <Text className="text-xs font-normal" style={{ color: theme.colors.textSecondary }}>
                Successfully Copied！
              </Text>
            }
            onOpen={handleCopyToClipboard}
            onClose={() => setTooltipShow(false)}
          >
            <Icon name="copy-all" className="mx-4" color={'#537FF6'} />
          </Tooltip>
        </View>
      )}
    </View>
  );
};

export default Secret;