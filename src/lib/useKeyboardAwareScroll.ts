import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import type { ScrollView, TextInputProps } from 'react-native';

type TextInputFocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];

type KeyboardAwareScrollOptions = {
  extraOffset?: number;
  scrollDelayMs?: number;
  retryScrollDelayMs?: number;
};

type FocusHandlerOptions = {
  extraOffset?: number;
};

type ScrollResponder = {
  scrollResponderScrollNativeHandleToKeyboard?: (
    nodeHandle: number,
    additionalOffset?: number,
    preventNegativeScrollOffset?: boolean
  ) => void;
};

export function useKeyboardAwareScroll({
  extraOffset = Platform.OS === 'android' ? 144 : 96,
  scrollDelayMs = Platform.OS === 'android' ? 140 : 80,
  retryScrollDelayMs = Platform.OS === 'android' ? 280 : 0,
}: KeyboardAwareScrollOptions = {}) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollTimeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearScheduledScrolls = useCallback(() => {
    scrollTimeoutRefs.current.forEach(clearTimeout);
    scrollTimeoutRefs.current = [];
  }, []);

  const scrollToFocusedInput = useCallback((
    event: TextInputFocusEvent,
    options?: FocusHandlerOptions
  ) => {
    if (typeof event.nativeEvent.target !== 'number') {
      return;
    }

    const targetHandle = event.nativeEvent.target;
    const resolvedExtraOffset = options?.extraOffset ?? extraOffset;
    const performScroll = () => {
      const responder = scrollViewRef.current?.getScrollResponder?.() as
        | ScrollResponder
        | undefined;

      responder?.scrollResponderScrollNativeHandleToKeyboard?.(
        targetHandle,
        resolvedExtraOffset,
        true
      );
    };

    clearScheduledScrolls();

    scrollTimeoutRefs.current.push(setTimeout(performScroll, scrollDelayMs));

    if (retryScrollDelayMs > scrollDelayMs) {
      scrollTimeoutRefs.current.push(
        setTimeout(performScroll, retryScrollDelayMs)
      );
    }
  }, [clearScheduledScrolls, extraOffset, retryScrollDelayMs, scrollDelayMs]);

  const createFocusHandler = useCallback(
    (
      onFocus?: (event: TextInputFocusEvent) => void,
      options?: FocusHandlerOptions
    ) =>
      (event: TextInputFocusEvent) => {
        onFocus?.(event);
        scrollToFocusedInput(event, options);
      },
    [scrollToFocusedInput]
  );

  useEffect(
    () => () => {
      clearScheduledScrolls();
    },
    [clearScheduledScrolls]
  );

  return {
    scrollViewRef,
    createFocusHandler,
  };
}
