import React, { forwardRef, type ComponentProps } from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, snapPoints as defaultSnapPoints, type BottomSheetMethods } from '@components/BottomSheet';

interface Props extends ComponentProps<typeof BottomSheet> {
  children: React.ReactNode;
  showTitle?: boolean | string;
}

const SendTransactionBottomSheet = forwardRef<BottomSheetMethods, Props>(({ children, snapPoints, showTitle = true, ...props }, ref) => {
  const { colors } = useTheme();

  return (
    <BottomSheet ref={ref} snapPoints={snapPoints || defaultSnapPoints.large} isRoute {...props}>
      <BottomSheetView style={styles.container}>
        {showTitle && <Text style={[styles.title, { color: colors.textPrimary }]}>{typeof showTitle === 'string' ? showTitle : 'Send To'}</Text>}
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    marginBottom: 0,
    lineHeight: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendTransactionBottomSheet;
