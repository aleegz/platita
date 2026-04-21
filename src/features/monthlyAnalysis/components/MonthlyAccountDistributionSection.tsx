import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StateCard } from '../../../components';
import { getAccountTypeLabel } from '../../accounts/types';
import { formatDashboardMoney, formatDashboardPercentage } from '../../dashboard';
import { colors } from '../../../theme';

import type { MonthlyAnalysisData, MonthlyOpeningAccountSnapshot } from '../types';

type MonthlyAccountDistributionSectionProps = {
  data: MonthlyAnalysisData;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

export function MonthlyAccountDistributionSection({
  data,
}: MonthlyAccountDistributionSectionProps) {
  const visibleAccounts =
    data.openingAccountsWithBalanceCount > 0
      ? data.openingAccountSnapshots.filter((account) => account.openingBalance !== 0)
      : data.openingAccountSnapshots;
  const hiddenZeroAccountsCount = Math.max(
    data.openingAccountSnapshots.length - visibleAccounts.length,
    0
  );
  const totalTone =
    data.openingBalanceTotal > 0
      ? styles.totalValuePositive
      : data.openingBalanceTotal < 0
        ? styles.totalValueNegative
        : null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Distribución por cuentas</Text>
        <Text style={styles.title}>Cómo arrancó el mes</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.heroCard}>
          <View style={styles.heroLabelRow}>
            <View style={styles.heroLabelIcon}>
              <Ionicons color={colors.text} name="wallet-outline" size={14} />
            </View>
            <Text style={styles.heroLabel}>Saldo total al abrir</Text>
          </View>
          <Text style={[styles.totalValue, totalTone]}>
            {formatDashboardMoney(data.openingBalanceTotal)}
          </Text>
          <Text style={styles.heroNarrative}>{getOpeningNarrative(data)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryMetric
            iconName="layers-outline"
            label="Cuentas activas"
            value={String(data.openingAccountCount)}
          />
          <SummaryMetric
            iconName="wallet-outline"
            label="Con saldo"
            value={String(data.openingAccountsWithBalanceCount)}
          />
        </View>

        {data.openingAccountCount === 0 ? (
          <StateCard
            align="left"
            description="Todavía no hay cuentas activas para calcular el punto de partida del período."
            iconName="wallet-outline"
            title="Sin cuentas activas"
          />
        ) : (
          <>
            <View style={styles.list}>
              {visibleAccounts.map((account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </View>

            {hiddenZeroAccountsCount > 0 ? (
              <Text style={styles.footnote}>
                Además, {hiddenZeroAccountsCount} cuenta
                {hiddenZeroAccountsCount === 1 ? '' : 's'} arrancó
                {hiddenZeroAccountsCount === 1 ? '' : 'ron'} sin saldo.
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

function SummaryMetric({
  iconName,
  label,
  value,
}: {
  iconName: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryMetric}>
      <View style={styles.summaryLabelRow}>
        <Ionicons color={colors.muted} name={iconName} size={14} />
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function AccountRow({ account }: { account: MonthlyOpeningAccountSnapshot }) {
  const fillWidth = account.distributionShare
    ? (`${Math.max(account.distributionShare * 100, 8)}%` as const)
    : ('0%' as const);
  const amountTone =
    account.openingBalance > 0
      ? styles.accountAmountPositive
      : account.openingBalance < 0
        ? styles.accountAmountNegative
        : null;

  return (
    <View style={styles.rowCard}>
      <View style={styles.rowHeader}>
        <View style={styles.rowIdentity}>
          <View style={styles.accountTypeIcon}>
            <Ionicons color={colors.text} name={getAccountTypeIconName(account.type)} size={16} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountMeta}>
              {getAccountTypeLabel(account.type)} · {getAccountShareLabel(account)}
            </Text>
          </View>
        </View>

        <Text style={[styles.accountAmount, amountTone]}>
          {formatDashboardMoney(account.openingBalance)}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            account.openingBalance < 0 ? styles.trackFillNegative : null,
            { width: fillWidth },
          ]}
        />
      </View>
    </View>
  );
}

function getOpeningNarrative(data: MonthlyAnalysisData) {
  if (data.openingAccountCount === 0) {
    return 'No hay cuentas activas para reconstruir el arranque del período.';
  }

  if (data.openingBalanceTotal > 0) {
    return 'Este era tu colchón total antes del primer movimiento del mes.';
  }

  if (data.openingBalanceTotal < 0) {
    return 'El mes arrancó con saldo neto en rojo entre las cuentas activas.';
  }

  return 'El período abrió prácticamente en equilibrio entre tus cuentas activas.';
}

function getAccountShareLabel(account: MonthlyOpeningAccountSnapshot) {
  if (account.distributionShare !== null) {
    return `${formatDashboardPercentage(account.distributionShare * 100)} del saldo repartido`;
  }

  if (account.openingBalance < 0) {
    return 'restaba saldo al abrir';
  }

  return 'sin saldo al abrir';
}

function getAccountTypeIconName(type: MonthlyOpeningAccountSnapshot['type']): IconName {
  switch (type) {
    case 'cash':
      return 'cash-outline';
    case 'bank':
      return 'business-outline';
    case 'wallet':
      return 'phone-portrait-outline';
    case 'investment':
      return 'trending-up-outline';
    case 'credit':
      return 'card-outline';
    default:
      return 'wallet-outline';
  }
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 36,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  heroCard: {
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLabelIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  totalValuePositive: {
    color: colors.text,
  },
  totalValueNegative: {
    color: '#FFD6D2',
  },
  heroNarrative: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryMetric: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  list: {
    gap: 12,
  },
  rowCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  accountTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  accountMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  accountAmount: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: -0.2,
  },
  accountAmountPositive: {
    color: colors.text,
  },
  accountAmountNegative: {
    color: '#FFD6D2',
  },
  track: {
    overflow: 'hidden',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(10, 132, 255, 0.78)',
  },
  trackFillNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.78)',
  },
  footnote: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
