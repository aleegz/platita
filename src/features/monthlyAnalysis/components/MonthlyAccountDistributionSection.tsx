import { StyleSheet, Text, View } from 'react-native';

import { StateCard } from '../../../components';
import { getAccountTypeLabel } from '../../accounts/types';
import {
  formatDashboardMoney,
  formatDashboardPercentage,
  formatDashboardPeriod,
} from '../../dashboard';
import { colors } from '../../../theme';

import type { MonthlyAnalysisData, MonthlyOpeningAccountSnapshot } from '../types';

type MonthlyAccountDistributionSectionProps = {
  data: MonthlyAnalysisData;
};

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
          <Text style={styles.heroLabel}>Saldo total al abrir</Text>
          <Text style={[styles.totalValue, totalTone]}>
            {formatDashboardMoney(data.openingBalanceTotal)}
          </Text>
          <Text style={styles.heroNarrative}>{getOpeningNarrative(data)}</Text>
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

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryLabel}>{label}</Text>
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
        <View style={styles.rowCopy}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountMeta}>
            {getAccountTypeLabel(account.type)} · {getAccountShareLabel(account)}
          </Text>
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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.9,
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
  heroLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  totalValuePositive: {
    color: colors.text,
  },
  totalValueNegative: {
    color: '#FFD6D2',
  },
  heroNarrative: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
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
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
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
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    color: colors.text,
    fontSize: 16,
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
    fontSize: 15,
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
