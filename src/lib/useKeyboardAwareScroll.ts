import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  Platform,
  UIManager,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
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

type MeasuredLayout = {
  height: number;
  pageY: number;
};

export function useKeyboardAwareScroll({
  extraOffset = Platform.OS === 'android' ? 28 : 24,
  scrollDelayMs = Platform.OS === 'android' ? 140 : 80,
  retryScrollDelayMs = Platform.OS === 'android' ? 280 : 0,
}: KeyboardAwareScrollOptions = {}) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollTimeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const keyboardFrameRef = useRef<{ screenY: number } | null>(null);
  const scrollOffsetYRef = useRef(0);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);

  const clearScheduledScrolls = useCallback(() => {
    scrollTimeoutRefs.current.forEach(clearTimeout);
    scrollTimeoutRefs.current = [];
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  const measureInWindow = useCallback((nodeHandle: number) => {
    return new Promise<MeasuredLayout | null>((resolve) => {
      UIManager.measureInWindow(nodeHandle, (_x, pageY, _width, height) => {
        resolve(height > 0 ? { height, pageY } : null);
      });
    });
  }, []);

  const scrollToFocusedInput = useCallback(
    (event: TextInputFocusEvent, options?: FocusHandlerOptions) => {
      if (typeof event.nativeEvent.target !== 'number') {
        return;
      }

      const targetHandle = event.nativeEvent.target;
      const resolvedExtraOffset = options?.extraOffset ?? extraOffset;
      const performScroll = async () => {
        const scrollView = scrollViewRef.current;
        const scrollNode = scrollView?.getNativeScrollRef?.() ?? scrollView;
        const scrollHandle = scrollNode ? findNodeHandle(scrollNode as never) : null;

        if (!scrollView || typeof scrollHandle !== 'number') {
          return;
        }

        const [scrollLayout, targetLayout] = await Promise.all([
          measureInWindow(scrollHandle),
          measureInWindow(targetHandle),
        ]);

        if (!scrollLayout || !targetLayout) {
          return;
        }

        const keyboardFrame = keyboardFrameRef.current;
        const visibleTop = scrollLayout.pageY + 12;
        const visibleBottom = keyboardFrame
          ? keyboardFrame.screenY - resolvedExtraOffset
          : scrollLayout.pageY + scrollLayout.height - resolvedExtraOffset;
        const targetTop = targetLayout.pageY;
        const targetBottom = targetLayout.pageY + targetLayout.height;

        if (targetBottom > visibleBottom) {
          scrollView.scrollTo({
            y: Math.max(scrollOffsetYRef.current + (targetBottom - visibleBottom), 0),
            animated: true,
          });
          return;
        }

        if (targetTop < visibleTop) {
          scrollView.scrollTo({
            y: Math.max(scrollOffsetYRef.current - (visibleTop - targetTop), 0),
            animated: true,
          });
        }
      };

      clearScheduledScrolls();
      scrollTimeoutRefs.current.push(setTimeout(() => void performScroll(), scrollDelayMs));

      if (retryScrollDelayMs > scrollDelayMs) {
        scrollTimeoutRefs.current.push(
          setTimeout(() => void performScroll(), retryScrollDelayMs)
        );
      }
    },
    [clearScheduledScrolls, extraOffset, measureInWindow, retryScrollDelayMs, scrollDelayMs]
  );

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

  useEffect(() => {
    const handleKeyboardShow = (event: KeyboardEvent) => {
      const screenHeight = Dimensions.get('screen').height;
      const bottomInsetFromFrame = Math.max(screenHeight - event.endCoordinates.screenY, 0);
      const bottomInset = Math.max(bottomInsetFromFrame, event.endCoordinates.height, 0);

      keyboardFrameRef.current = {
        screenY: event.endCoordinates.screenY,
      };
      setKeyboardBottomInset(bottomInset);
    };

    const handleKeyboardHide = () => {
      keyboardFrameRef.current = null;
      setKeyboardBottomInset(0);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const changeSubscription =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillChangeFrame', handleKeyboardShow)
        : null;
    const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSubscription.remove();
      changeSubscription?.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    keyboardBottomInset,
    handleScroll,
    scrollViewRef,
    createFocusHandler,
  };
}
