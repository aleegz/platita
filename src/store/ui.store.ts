import { create } from 'zustand';

import type {
  SnackbarState,
  SnackbarVariant,
  UiLoadingFlagKey,
  UiLoadingFlags,
  UiOverlayState,
} from '../types/store';

export type UiStoreState = {
  loadingFlags: UiLoadingFlags;
  snackbar: SnackbarState;
  modal: UiOverlayState;
  bottomSheet: UiOverlayState;
  setLoadingFlag: (key: UiLoadingFlagKey, value: boolean) => void;
  resetLoadingFlags: () => void;
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
  hideSnackbar: () => void;
  openModal: (
    key: string,
    params?: Record<string, unknown> | null
  ) => void;
  closeModal: () => void;
  openBottomSheet: (
    key: string,
    params?: Record<string, unknown> | null
  ) => void;
  closeBottomSheet: () => void;
};

const initialLoadingFlags: UiLoadingFlags = {
  appBootstrap: false,
  accounts: false,
  categories: false,
  transactions: false,
  budgets: false,
  economicData: false,
  dashboard: false,
};

const initialSnackbarState: SnackbarState = {
  visible: false,
  message: '',
  variant: 'info',
};

const initialOverlayState: UiOverlayState = {
  key: null,
  params: null,
};

export const useUiStore = create<UiStoreState>((set) => ({
  loadingFlags: initialLoadingFlags,
  snackbar: initialSnackbarState,
  modal: initialOverlayState,
  bottomSheet: initialOverlayState,
  setLoadingFlag: (key, value) =>
    set((state) => ({
      loadingFlags: {
        ...state.loadingFlags,
        [key]: value,
      },
    })),
  resetLoadingFlags: () =>
    set({
      loadingFlags: initialLoadingFlags,
    }),
  showSnackbar: (message, variant = 'info') =>
    set({
      snackbar: {
        visible: true,
        message,
        variant,
      },
    }),
  hideSnackbar: () =>
    set({
      snackbar: initialSnackbarState,
    }),
  openModal: (key, params = null) =>
    set({
      modal: {
        key,
        params,
      },
    }),
  closeModal: () =>
    set({
      modal: initialOverlayState,
    }),
  openBottomSheet: (key, params = null) =>
    set({
      bottomSheet: {
        key,
        params,
      },
    }),
  closeBottomSheet: () =>
    set({
      bottomSheet: initialOverlayState,
    }),
}));

export const uiStoreSelectors = {
  loadingFlags: (state: UiStoreState) => state.loadingFlags,
  snackbar: (state: UiStoreState) => state.snackbar,
  modal: (state: UiStoreState) => state.modal,
  bottomSheet: (state: UiStoreState) => state.bottomSheet,
  isAppBootstrapping: (state: UiStoreState) =>
    state.loadingFlags.appBootstrap,
} as const;
