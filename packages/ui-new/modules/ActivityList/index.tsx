import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { useUnfinishedTxs, useFinishedTxs } from '@core/WalletCore/Plugins/ReactInject';
import { type Tx } from '@core/database/models/Tx';
import Text from '@components/Text';
import NoneActivity from '@assets/images/none-activity.webp';
import Calendar from '@assets/icons/calendar.svg';
import { styles as noneStyles } from '../AssetsList/TokensList/ReceiveFunds';
import ActivityItem from './ActivityItem';

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

const MONTH_TXT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];

class ActivityDate {
  year: number;
  month: number;
  day: number;
  constructor({ year, month, day }: { year: number; month: number; day: number }) {
    this.year = year;
    this.month = month;
    this.day = day;
  }
}
const formatDate = (time: number) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new ActivityDate({ year, month, day });
};

const ActivityList: React.FC<{ onPress?: (v: Tx) => void }> = memo(({ onPress }) => {
  const { colors } = useTheme();
  const finishedTxs = useFinishedTxs();
  const unfinishedTxs = useUnfinishedTxs();
  const { t } = useTranslation();

  const finishedTxsByDay = useMemo(() => {
    let day: number;
    const txs: (
      | Tx
      | {
          year: number;
          month: number;
          day: number;
        }
    )[] = [];
    finishedTxs?.forEach((tx) => {
      const time = Math.floor((tx.executedAt || tx.createdAt).valueOf() / DAY_MILLISECONDS) * DAY_MILLISECONDS;
      if (day !== time) {
        day = time;
        txs.push(formatDate(time));
      }
      txs.push(tx);
    });
    return txs;
  }, [finishedTxs]);

  if (!unfinishedTxs?.length && !finishedTxsByDay.length) {
    return (
      <>
        <Image style={noneStyles.noneImg} source={NoneActivity} contentFit="contain" />
        <Text style={[noneStyles.noneText, { color: colors.textSecondary }]}>{t('tab.content.noActivity')}</Text>
      </>
    );
  }

  return (
    <>
      {!!unfinishedTxs?.length && unfinishedTxs.map((tx) => <ActivityItem key={(tx as Tx).id} tx={tx} onPress={onPress} />)}
      {finishedTxs?.length > 0 &&
        finishedTxsByDay.map((tx) =>
          tx instanceof ActivityDate ? (
            <View style={styles.dateWrapper} key={`${tx.day}${tx.month}${tx.year}`}>
              <Calendar color={colors.textSecondary} />
              <Text style={[styles.date, { color: colors.textSecondary, borderColor: colors.borderThird }]}>
                {MONTH_TXT[tx.month]} {tx.day},{'  '}
                {tx.year}
              </Text>
            </View>
          ) : (
            <ActivityItem key={(tx as Tx).id} tx={tx as Tx} onPress={onPress} />
          ),
        )}
    </>
  );
});

const styles = StyleSheet.create({
  dateWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 26,
  },
  date: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 18,
    marginLeft: 4,
  },
  img: {
    alignSelf: 'center',
    width: 120,
    aspectRatio: 1,
    marginTop: 36,
  },
});

export default ActivityList;
