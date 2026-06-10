import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import {
  createUserFacingError,
  getUserFacingMessage,
} from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { useDomainInvalidationStore } from '../../store/domain-invalidation.store';
import type { Account } from '../../types/domain';
import { createAccountService } from './service';
import type { SaveAccountInput } from './types';

type AccountsState = {
  accounts: Account[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type UseAccountsOptions = {
  includeInactive?: boolean;
};

type AccountState = {
  account: Account | null;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type AccountMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  createAccount: (input: SaveAccountInput) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccount: (id: string, input: SaveAccountInput) => Promise<Account>;
};

export function useAccounts(options?: UseAccountsOptions): AccountsState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const includeInactive = options?.includeInactive ?? false;

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const service = createAccountService(database);
      const nextAccounts = includeInactive
        ? await service.listAccounts()
        : await service.listActiveAccounts();

      animateNextLayout();
      setAccounts(nextAccounts);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage(
        includeInactive
          ? 'No se pudieron cargar las cuentas.'
          : 'No se pudieron cargar las cuentas activas.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [isFocused, database, includeInactive]);

  return {
    accounts,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useAccount(accountId?: string): AccountState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(accountId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    if (!accountId) {
      animateNextLayout();
      setAccount(null);
      setErrorMessage('No se encontró la cuenta solicitada.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextAccount = await createAccountService(database).getAccountById(accountId);

      if (!nextAccount) {
        animateNextLayout();
        setAccount(null);
        setErrorMessage('La cuenta ya no existe o no está disponible.');
        return;
      }

      animateNextLayout();
      setAccount(nextAccount);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudo cargar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [accountId, isFocused, database]);

  return {
    account,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useAccountMutations(): AccountMutations {
  const database = useDatabase();
  const invalidateTransactions = useDomainInvalidationStore(
    (state) => state.invalidateTransactions
  );
  const invalidateTransactionReferences = useDomainInvalidationStore(
    (state) => state.invalidateTransactionReferences
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createAccount(input: SaveAccountInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const account = await createAccountService(database).createAccount(input);

      invalidateTransactionReferences();

      return account;
    } catch (error) {
      console.error(error);
      setErrorMessage(getUserFacingMessage(error, 'No se pudo guardar la cuenta.'));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateAccount(id: string, input: SaveAccountInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const account = await createAccountService(database).updateAccount(id, input);

      if (!account) {
        throw createUserFacingError(
          'La cuenta ya no existe o no está disponible.'
        );
      }

      invalidateTransactionReferences();

      return account;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo actualizar la cuenta.')
      );

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteAccount(id: string) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createAccountService(database).deleteAccount(id);

      invalidateTransactions();
      invalidateTransactionReferences();
    } catch (error) {
      const userMessage = getUserFacingMessage(error, 'No se pudo eliminar la cuenta.');

      if (userMessage !== 'No puedes eliminar una cuenta que ya tiene movimientos asociados.') {
        console.error(error);
      }

      setErrorMessage(userMessage);

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    errorMessage,
    createAccount,
    deleteAccount,
    updateAccount,
  };
}
