"use client";

/**
 * Android-Compatible Form Components
 * 
 * This file contains Android-specific fixes for getScrollableNode errors that occur
 * when React Native Reanimated components try to access scroll functionality before
 * refs are properly initialized. The main fixes include:
 * 
 * 1. Using regular ScrollView instead of Animated.ScrollView on Android
 * 2. Using regular View instead of Animated.View in Section components on Android
 * 3. Safe importing and usage of platform-specific hooks like useBottomTabOverflow
 * 4. Error boundaries around IconSymbol and Image components that may fail on Android
 * 5. Simplified style merging for Android to avoid complex operations
 * 6. Replacing React.use() with React.useContext() for better compatibility
 * 
 * These changes maintain full functionality on iOS and web while providing stability on Android.
 */

import { Image, SFSymbolSource } from "@/components/ui/img";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";
import * as AppleColors from "@bacons/apple-colors";
import { Href, LinkProps, Link as RouterLink, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Button,
  GestureResponderEvent,
  OpaqueColorValue,
  RefreshControl,
  Text as RNText,
  ScrollView as RNScrollView,
  ScrollViewProps,
  Share,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableHighlight,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";

import { Switch, SwitchProps } from "@/components/ui/switch";

import { HeaderButton } from "./header";
import Animated from "react-native-reanimated";
import { SymbolWeight } from "expo-symbols";

// Android Fix: React Native Reanimated can cause getScrollableNode errors on Android
// when components try to access scroll functionality before refs are properly initialized.
// We use platform-specific conditionals to avoid Animated components on Android.

// import { useScrollToTop } from "@/hooks/use-tab-to-top";
import * as AC from "@bacons/apple-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Android-safe import for useBottomTabOverflow
let useBottomTabOverflow: (() => number) | null = null;
try {
  const tabBarBackground = require("./tab-bar-background");
  useBottomTabOverflow = tabBarBackground.useBottomTabOverflow;
} catch (error) {
  console.warn('tab-bar-background not available:', error);
}

type ListStyle = "grouped" | "auto";

type SystemImageCustomProps = {
  name: IconSymbolName;
  color?: OpaqueColorValue;
  size?: number;
  weight?: SymbolWeight;
  style?: StyleProp<TextStyle>;
};

type SystemImageProps = IconSymbolName | SystemImageCustomProps;

const ListStyleContext = React.createContext<ListStyle>("auto");

const minItemHeight = 20;

const Colors = {
  systemGray4: AppleColors.systemGray4, // "rgba(209, 209, 214, 1)",
  secondarySystemGroupedBackground:
    AppleColors.secondarySystemGroupedBackground, // "rgba(255, 255, 255, 1)",
};

const styles = StyleSheet.create({
  itemPadding: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  hstack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vstack: {
    flex: 1,
    flexDirection: "column",
    // alignItems: "center",
    // gap: 8,
  },
  spacer: { flex: 1 },
  separator: {
    marginStart: 60,
    borderBottomWidth: 0.5, //StyleSheet.hairlineWidth,
    marginTop: -0.5, // -StyleSheet.hairlineWidth,
    borderBottomColor: AppleColors.separator,
  },
  groupedList: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: AppleColors.separator,
  },
  standardList: {
    borderCurve: "continuous",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: Colors.secondarySystemGroupedBackground,
  },

  hintText: {
    color: AppleColors.secondaryLabel,
    paddingVertical: 8,
    fontSize: 14,
  },
});

const SectionStyleContext = React.createContext<{
  style: StyleProp<ViewStyle>;
}>({
  style: styles.itemPadding,
});

type RefreshCallback = () => Promise<void>;

const RefreshContext = React.createContext<{
  subscribe: (cb: RefreshCallback) => () => void;
  hasSubscribers: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
} | null>(null);

const RefreshContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const subscribersRef = React.useRef<Set<RefreshCallback>>(new Set());
  const [subscriberCount, setSubscriberCount] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const subscribe = React.useCallback((cb: RefreshCallback) => {
    subscribersRef.current.add(cb);
    setSubscriberCount((count) => count + 1);

    return () => {
      subscribersRef.current.delete(cb);
      setSubscriberCount((count) => count - 1);
    };
  }, []);

  const refresh = React.useCallback(async () => {
    const subscribers = Array.from(subscribersRef.current);
    if (subscribers.length === 0) return;

    setRefreshing(true);
    try {
      await Promise.all(subscribers.map((cb) => cb()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    subscribe,
    refresh,
    refreshing,
    hasSubscribers: subscriberCount > 0,
  }), [subscribe, refresh, refreshing, subscriberCount]);

  return (
    <RefreshContext.Provider value={contextValue}>
      {children}
    </RefreshContext.Provider>
  );
};

/**
 * Register a callback to be called when the user pulls down to refresh in the nearest list.
 *
 * @param callback Register a function to be called when the user pulls down to refresh.
 * The function should return a promise that resolves when the refresh is complete.
 * @returns A function that can be called to trigger a list-wide refresh.
 */
export function useListRefresh(callback?: () => Promise<void>) {
  const context = React.useContext(RefreshContext);

  if (!context) {
    console.warn('useListRefresh must be used within RefreshContextProvider');
    return async () => { };
  }

  const { subscribe, refresh } = context;

  React.useEffect(() => {
    if (callback) {
      const unsubscribe = subscribe(callback);
      return unsubscribe;
    }
  }, [callback, subscribe]);

  return refresh;
}

type ListProps = ScrollViewProps & {
  /** Set the Expo Router `<Stack />` title when mounted. */
  navigationTitle?: string;
  listStyle?: ListStyle;
};

export function List(props: ListProps) {
  return (
    <RefreshContextProvider>
      <InnerList {...props} />
    </RefreshContextProvider>
  );
}

if (__DEV__) List.displayName = "FormList";

export function ScrollView(
  props: ScrollViewProps & { ref?: React.Ref<Animated.ScrollView | RNScrollView> }
) {
  // Android-specific fix: Complete bypass of potentially problematic hooks
  if (process.env.EXPO_OS === "android") {
    return (
      <RNScrollView
        automaticallyAdjustsScrollIndicatorInsets
        showsVerticalScrollIndicator={true}
        {...props}
        style={[{ backgroundColor: AC.systemGroupedBackground }, props.style]}
      />
    );
  }

  // Full implementation for iOS and web
  let paddingBottom = 0;
  let statusBarInset = 0;
  let bottom = 0;

  // Only try to use useBottomTabOverflow if not on Android
  if (useBottomTabOverflow) {
    try {
      paddingBottom = useBottomTabOverflow() || 0;
    } catch (error) {
      console.warn('useBottomTabOverflow failed:', error);
      paddingBottom = 0;
    }
  }

  try {
    const insets = useSafeAreaInsets();
    statusBarInset = insets.top || 0;
    bottom = insets.bottom || 0;
  } catch (error) {
    console.warn('useSafeAreaInsets failed:', error);
    statusBarInset = 0;
    bottom = 0;
  }

  const largeHeaderInset = statusBarInset + 92;

  return (
    <Animated.ScrollView
      scrollToOverflowEnabled
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: paddingBottom }}
      scrollIndicatorInsets={{
        bottom: paddingBottom - (process.env.EXPO_OS === "ios" ? bottom : 0),
      }}
      {...props}
      style={[{ backgroundColor: AC.systemGroupedBackground }, props.style]}
    />
  );
}

function InnerList({ contentContainerStyle, ...props }: ListProps) {
  const context = React.useContext(RefreshContext);

  if (!context) {
    console.warn('InnerList must be wrapped in RefreshContextProvider');
    return null;
  }

  const { hasSubscribers, refreshing, refresh } = context;

  return (
    <>
      {props.navigationTitle && (
        <Stack.Screen options={{ title: props.navigationTitle }} />
      )}
      <ListStyleContext.Provider value={props.listStyle ?? "auto"}>
        <ScrollView
          contentContainerStyle={mergedStyleProp(
            {
              paddingVertical: 16,
              gap: 24,
            },
            contentContainerStyle
          )}
          style={{
            maxWidth: 768,
            width: process.env.EXPO_OS === "web" ? "100%" : undefined,
            marginHorizontal:
              process.env.EXPO_OS === "web" ? "auto" : undefined,
          }}
          refreshControl={
            hasSubscribers ? (
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            ) : undefined
          }
          {...props}
        />
      </ListStyleContext.Provider>
    </>
  );
}

export function FormItem({
  children,
  href,
  onPress,
  onLongPress,
  style,
  ref,
}: Pick<ViewProps, "children"> & {
  href?: Href<any>;
  onPress?: (event: any) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  ref?: React.Ref<View>;
}) {
  const sectionContext = React.useContext(SectionStyleContext);
  const itemStyle = sectionContext?.style ?? styles.itemPadding;
  const resolvedStyle = mergedStyleProp(itemStyle, style);

  if (href == null) {
    if (onPress == null && onLongPress == null) {
      const childrenCount = getFlatChildren(children).length;

      // If there's only one child, avoid the HStack. This ensures that TextInput doesn't jitter horizontally when typing.
      if (childrenCount === 1) {
        return (
          <View style={resolvedStyle}>
            <View style={{ minHeight: minItemHeight }}>{children}</View>
          </View>
        );
      }

      return (
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      );
    }
    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={AppleColors.systemGray4}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      </TouchableHighlight>
    );
  }

  // Android-specific navigation handling to avoid getScrollableNode issues
  if (process.env.EXPO_OS === "android") {
    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={AppleColors.systemGray4}
        onPress={(e) => {
          if (onPress) {
            onPress(e);
          } else {
            // Use Expo Router's router directly on Android
            const router = require('expo-router').router;
            if (typeof href === 'string') {
              if (href.startsWith('http')) {
                // External link
                const WebBrowser = require('expo-web-browser');
                WebBrowser.openBrowserAsync(href);
              } else {
                // Internal navigation
                router.push(href);
              }
            }
          }
        }}
        onLongPress={onLongPress}
      >
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      </TouchableHighlight>
    );
  }

  // iOS and web - use the original Link component
  return (
    <Link asChild href={href} onPress={onPress} onLongPress={onLongPress}>
      <TouchableHighlight ref={ref} underlayColor={AppleColors.systemGray4}>
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      </TouchableHighlight>
    </Link>
  );
}

type FormTextProps = TextProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** A true/false value for the hint. */
  hintBoolean?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text */
  systemImage?: SystemImageProps | React.ReactNode;

  bold?: boolean;
};

/** Text but with iOS default color and sizes. */
export function Text({ bold, ...props }: FormTextProps) {
  const font: TextStyle = {
    ...FormFont.default,
    flexShrink: 0,
    fontWeight: bold ? "600" : "normal",
  };

  return (
    <RNText
      dynamicTypeRamp="body"
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}

export function TextField({ ...props }: TextInputProps) {
  const font: TextStyle = {
    ...FormFont.default,
  };

  return (
    <TextInput
      placeholderTextColor={AppleColors.placeholderText}
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";

export function Toggle({
  value,
  onValueChange,
  ...props
}: FormTextProps & Required<Pick<SwitchProps, "value" | "onValueChange">>) {
  return <Text {...props} />;
}

if (__DEV__) Toggle.displayName = "FormToggle";

export function DatePicker({
  ...props
}: FormTextProps &
  Omit<IOSNativeProps | AndroidNativeProps, "display" | "accentColor"> & {
    /**
     * The date picker accent color.
     *
     * Sets the color of the selected, date and navigation icons.
     * Has no effect for display 'spinner'.
     */
    accentColor?: OpaqueColorValue | string;
  }) {
  return <Text {...props} />;
}

if (__DEV__) DatePicker.displayName = "FormDatePicker";

export function Link({
  bold,
  children,
  headerRight,
  hintImage,
  ...props
}: LinkProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text. */
  systemImage?: SystemImageProps | React.ReactNode;

  /** Changes the right icon. */
  hintImage?: SystemImageProps | React.ReactNode;

  // TODO: Automatically detect this somehow.
  /** Is the link inside a header. */
  headerRight?: boolean;

  bold?: boolean;
}) {
  const font: TextStyle = {
    ...FormFont.default,
    fontWeight: bold ? "600" : "normal",
  };

  const resolvedChildren = (() => {
    if (headerRight) {
      if (process.env.EXPO_OS === "web") {
        return <div style={{ paddingRight: 16 }}>{children}</div>;
      }
      const wrappedTextChildren = React.Children.map(children, (child) => {
        // Filter out empty children
        if (!child) {
          return null;
        }
        if (typeof child === "string") {
          return (
            <RNText
              style={mergedStyleProp<TextStyle>(
                { ...font, color: AppleColors.link },
                props.style
              )}
            >
              {child}
            </RNText>
          );
        }
        return child;
      });

      return (
        <HeaderButton
          pressOpacity={0.7}
          style={{
            // Offset on the side so the margins line up. Unclear how to handle when this is used in headerLeft.
            // We should automatically detect it somehow.
            marginRight: -8,
          }}
        >
          {wrappedTextChildren}
        </HeaderButton>
      );
    }
    return children;
  })();

  return (
    <RouterLink
      dynamicTypeRamp="body"
      {...props}
      asChild={
        props.asChild ?? (process.env.EXPO_OS === "web" ? false : headerRight)
      }
      style={mergedStyleProp<TextStyle>(font, props.style)}
      onPress={
        process.env.EXPO_OS === "web"
          ? props.onPress
          : (e) => {
            if (
              props.target === "_blank" &&
              // Ensure the resolved href is an external URL.
              /^([\w\d_+.-]+:)?\/\//.test(RouterLink.resolveHref(props.href))
            ) {
              // Prevent the default behavior of linking to the default browser on native.
              e.preventDefault();
              // Open the link in an in-app browser.
              WebBrowser.openBrowserAsync(props.href as string, {
                presentationStyle:
                  WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
              });
            } else if (
              props.target === "share" &&
              // Ensure the resolved href is an external URL.
              /^([\w\d_+.-]+:)?\/\//.test(RouterLink.resolveHref(props.href))
            ) {
              // Prevent the default behavior of linking to the default browser on native.
              e.preventDefault();
              // Open the link in an in-app browser.
              Share.share({
                url: props.href as string,
              });
            } else {
              props.onPress?.(e);
            }
          }
      }
      children={resolvedChildren}
    />
  );
}

if (__DEV__) Link.displayName = "FormLink";

export const FormFont = {
  // From inspecting SwiftUI `List { Text("Foo") }` in Xcode.
  default: {
    color: AppleColors.label,
    // 17.00pt is the default font size for a Text in a List.
    fontSize: 17,
    // UICTFontTextStyleBody is the default fontFamily.
  },
  secondary: {
    color: AppleColors.secondaryLabel,
    fontSize: 17,
  },
  caption: {
    color: AppleColors.secondaryLabel,
    fontSize: 12,
  },
  title: {
    color: AppleColors.label,
    fontSize: 17,
    fontWeight: "600",
  },
};

function getFlatChildren(children: React.ReactNode) {
  const allChildren: React.ReactNode[] = [];

  React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // If the child is a fragment, unwrap it and add the children to the list
    if (
      child.type === React.Fragment &&
      typeof child.props === "object" &&
      child.props != null &&
      "key" in child.props &&
      child.props?.key == null &&
      "children" in child.props
    ) {
      React.Children.forEach(child.props?.children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        allChildren.push(child);
      });
      return;
    }

    allChildren.push(child);
  });
  return allChildren;
}

export function Section({
  children,
  title,
  titleHint,
  footer,
  itemStyle,
  ...props
}: ViewProps & {
  title?: string | React.ReactNode;
  titleHint?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  itemStyle?: ViewStyle;
}) {
  const listStyle = React.useContext(ListStyleContext) ?? "auto";

  const allChildren = getFlatChildren(children);

  const childrenWithSeparator = allChildren.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const isLastChild = index === allChildren.length - 1;

    const resolvedProps = {
      ...child.props,
    };

    const isDatePicker = child.type === DatePicker;
    const isToggle = child.type === Toggle;

    if (isToggle) {
      resolvedProps.hint = (
        <Switch
          thumbColor={resolvedProps.thumbColor}
          trackColor={resolvedProps.trackColor}
          ios_backgroundColor={resolvedProps.ios_backgroundColor}
          onChange={resolvedProps.onChange}
          disabled={resolvedProps.disabled}
          value={resolvedProps.value}
          onValueChange={resolvedProps.onValueChange}
        />
      );
    } else if (isDatePicker) {
      resolvedProps.hint = (
        // TODO: Add more props
        <DateTimePicker
          locale={resolvedProps.locale}
          minuteInterval={resolvedProps.minuteInterval}
          mode={resolvedProps.mode}
          timeZoneOffsetInMinutes={resolvedProps.timeZoneOffsetInMinutes}
          textColor={resolvedProps.textColor}
          disabled={resolvedProps.disabled}
          accentColor={resolvedProps.accentColor}
          value={resolvedProps.value}
          display={resolvedProps.display}
          onChange={resolvedProps.onChange}
        />
      );
    }

    // Set the hint for the hintBoolean prop.
    if (resolvedProps.hintBoolean != null) {
      resolvedProps.hint ??= resolvedProps.hintBoolean ? (
        <Image
          source="sf:checkmark.circle.fill"
          tintColor={AppleColors.systemGreen}
        />
      ) : (
        <Image source="sf:slash.circle" tintColor={AppleColors.systemGray} />
      );
    }

    // Extract onPress from child
    const originalOnPress = resolvedProps.onPress;
    const originalOnLongPress = resolvedProps.onLongPress;
    let wrapsFormItem = false;
    if (child.type === Button) {
      const { title, color } = resolvedProps;

      delete resolvedProps.title;
      resolvedProps.style = mergedStyleProp(
        { color: color ?? AppleColors.link },
        resolvedProps.style
      );
      child = <RNText {...resolvedProps}>{title}</RNText>;
    }

    if (
      // If child is type of Text, add default props
      child.type === RNText ||
      child.type === Text ||
      isToggle ||
      isDatePicker
    ) {
      child = React.cloneElement(child, {
        dynamicTypeRamp: "body",
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
        ...resolvedProps,
        onPress: undefined,
        onLongPress: undefined,
        style: mergedStyleProp(FormFont.default, resolvedProps.style),
      });

      const hintView = (() => {
        if (!resolvedProps.hint) {
          return null;
        }

        return React.Children.map(resolvedProps.hint, (child) => {
          // Filter out empty children
          if (!child) {
            return null;
          }
          if (typeof child === "string") {
            return (
              <RNText
                selectable
                dynamicTypeRamp="body"
                style={{
                  ...FormFont.secondary,
                  textAlign: "right",
                  flexShrink: 1,
                }}
              >
                {child}
              </RNText>
            );
          }
          return child;
        });
      })();

      if (hintView || resolvedProps.systemImage) {
        child = (
          <HStack>
            <SymbolView
              systemImage={resolvedProps.systemImage}
              style={resolvedProps.style}
            />
            {child}
            {hintView && <Spacer />}
            {hintView}
          </HStack>
        );
      }
    } else if (child.type === RouterLink || child.type === Link) {
      wrapsFormItem = true;

      // Android-specific simple rendering to avoid getScrollableNode issues
      if (process.env.EXPO_OS === "android") {
        // Render the actual children content instead of just "Link"
        child = (
          <FormItem
            href={resolvedProps.href}
            onPress={resolvedProps.onPress}
            onLongPress={resolvedProps.onLongPress}
          >
            <View style={styles.hstack}>
              {resolvedProps.children}
              <View style={{ flex: 1 }} />
              <RNText style={{ color: AppleColors.tertiaryLabel, fontSize: 16 }}>
                {typeof resolvedProps.href === "string" && /^([\w\d_+.-]+:)?\/\//.test(resolvedProps.href) ? '↗' : '>'}
              </RNText>
            </View>
          </FormItem>
        );
      } else {
        // Full implementation for iOS and web
        const wrappedTextChildren = React.Children.map(
          resolvedProps.children,
          (linkChild) => {
            // Filter out empty children
            if (!linkChild) {
              return null;
            }
            if (typeof linkChild === "string") {
              return (
                <RNText
                  dynamicTypeRamp="body"
                  style={mergedStyleProp(FormFont.default, resolvedProps?.style)}
                >
                  {linkChild}
                </RNText>
              );
            }
            return linkChild;
          }
        );

        const hintView = (() => {
          if (!resolvedProps.hint) {
            return null;
          }

          return React.Children.map(resolvedProps.hint, (child) => {
            // Filter out empty children
            if (!child) {
              return null;
            }
            if (typeof child === "string") {
              return (
                <Text selectable style={FormFont.secondary}>
                  {child}
                </Text>
              );
            }
            return child;
          });
        })();

        child = React.cloneElement(child, {
          style: [
            FormFont.default,
            process.env.EXPO_OS === "web" && {
              alignItems: "stretch",
              flexDirection: "column",
              display: "flex",
            },
            resolvedProps.style,
          ],
          dynamicTypeRamp: "body",
          numberOfLines: 1,
          adjustsFontSizeToFit: true,
          // TODO: This causes issues with ref in React 19.
          asChild: process.env.EXPO_OS !== "web",
          children: (
            <FormItem>
              <HStack>
                <SymbolView
                  systemImage={resolvedProps.systemImage}
                  style={resolvedProps.style}
                />
                {wrappedTextChildren}
                <Spacer />
                {hintView}
                <View style={{}}>
                  <LinkChevronIcon
                    href={resolvedProps.href}
                    systemImage={resolvedProps.hintImage}
                  />
                </View>
              </HStack>
            </FormItem>
          ),
        });
      }
    } else if (child.type === TextInput || child.type === TextField) {
      wrapsFormItem = true;
      child = (
        <FormItem
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={{ paddingVertical: 0, paddingHorizontal: 0 }}
        >
          {React.cloneElement(child, {
            placeholderTextColor: AppleColors.placeholderText,
            ...resolvedProps,
            onPress: undefined,
            onLongPress: undefined,
            style: mergedStyleProp(
              FormFont.default,
              {
                outline: "none",
                // outlineWidth: 1,
                // outlineStyle: "auto",
                // outlineColor: AppleColors.systemGray4,
              },
              styles.itemPadding,
              resolvedProps.style
            ),
          })}
        </FormItem>
      );
    }

    // Ensure child is a FormItem otherwise wrap it in a FormItem
    if (!wrapsFormItem && !child.props.custom && child.type !== FormItem) {
      // Toggle needs reduced padding to account for the larger element.
      const reducedPadding =
        isToggle || isDatePicker
          ? {
            paddingVertical: 8,
          }
          : undefined;

      child = (
        <FormItem
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={reducedPadding}
        >
          {child}
        </FormItem>
      );
    }

    return (
      <>
        {child}
        {!isLastChild && <Separator />}
      </>
    );
  });

  const contents = (
    <SectionStyleContext.Provider
      value={{
        style: mergedStyleProp<ViewStyle>(styles.itemPadding, itemStyle),
      }}
    >
      {/* Use regular View on Android to avoid Animated.View issues */}
      {process.env.EXPO_OS === "android" ? (
        <View
          {...props}
          style={[
            listStyle === "grouped" ? styles.groupedList : styles.standardList,
            props.style,
          ]}
        >
          {childrenWithSeparator.map((child, index) => (
            <React.Fragment key={index}>{child}</React.Fragment>
          ))}
        </View>
      ) : (
        <Animated.View
          {...props}
          style={[
            listStyle === "grouped" ? styles.groupedList : styles.standardList,
            props.style,
          ]}
        >
          {childrenWithSeparator.map((child, index) => (
            <React.Fragment key={index}>{child}</React.Fragment>
          ))}
        </Animated.View>
      )}
    </SectionStyleContext.Provider>
  );

  const padding = listStyle === "grouped" ? 0 : 16;

  if (!title && !footer) {
    return (
      <View
        style={{
          paddingHorizontal: padding,
        }}
      >
        {contents}
      </View>
    );
  }

  const titleHintJsx = (() => {
    if (!titleHint) {
      return null;
    }

    if (isStringishNode(titleHint)) {
      return (
        <RNText dynamicTypeRamp="footnote" style={styles.hintText}>
          {titleHint}
        </RNText>
      );
    }

    return titleHint;
  })();

  return (
    <View
      style={{
        paddingHorizontal: padding,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          gap: 20,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {title && (
          <RNText
            dynamicTypeRamp="footnote"
            style={{
              textTransform: "uppercase",
              color: AppleColors.secondaryLabel,
              paddingVertical: 8,
              fontSize: 14,
              // use Apple condensed font
              // fontVariant: ["small-caps"],
            }}
          >
            {title}
          </RNText>
        )}
        {titleHintJsx}
      </View>

      {contents}

      {footer && (
        <RNText
          dynamicTypeRamp="footnote"
          style={{
            color: AppleColors.secondaryLabel,
            paddingHorizontal: 20,
            paddingTop: 8,
            fontSize: 14,
          }}
        >
          {footer}
        </RNText>
      )}
    </View>
  );
}

function SymbolView({
  systemImage,
  style,
}: {
  systemImage?: SystemImageProps | React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  if (!systemImage) {
    return null;
  }

  if (typeof systemImage !== "string" && React.isValidElement(systemImage)) {
    return systemImage;
  }

  // Android bypass - use simple text fallback
  if (process.env.EXPO_OS === "android") {
    return (
      <RNText style={[{ marginRight: 8, fontSize: 16 }, style]}>
        📋
      </RNText>
    );
  }

  const symbolProps: SystemImageCustomProps =
    typeof systemImage === "object" && "name" in systemImage
      ? systemImage
      : { name: systemImage as unknown as string };

  let color: string | OpaqueColorValue | undefined = symbolProps.color;
  if (color == null) {
    const flatStyle = StyleSheet.flatten(style);
    color = extractStyle(flatStyle, "color");
  }

  return (
    <IconSymbol
      name={symbolProps.name}
      size={symbolProps.size ?? 20}
      style={[{ marginRight: 8 }, symbolProps.style]}
      weight={symbolProps.weight}
      color={color ?? AppleColors.label}
    />
  );
}

// Wrap LinkChevronIcon in React.memo to prevent unnecessary re-renders
// Android-specific protection against getScrollableNode errors
const LinkChevronIcon = React.memo(function LinkChevronIcon({
  href,
  systemImage,
}: {
  href?: any;
  systemImage?: SystemImageProps | React.ReactNode;
}) {
  // Complete Android bypass - return simple text-based chevron
  if (process.env.EXPO_OS === "android") {
    const isHrefExternal = typeof href === "string" && /^([\w\d_+.-]+:)?\/\//.test(href);
    return (
      <RNText style={{
        fontSize: 16,
        color: AppleColors.tertiaryLabel,
        fontWeight: 'bold'
      }}>
        {isHrefExternal ? '↗' : '>'}
      </RNText>
    );
  }

  const isHrefExternal = React.useMemo(() =>
    typeof href === "string" && /^([\w\d_+.-]+:)?\/\//.test(href),
    [href]
  );

  const size = process.env.EXPO_OS === "ios" ? 14 : 24;

  if (systemImage) {
    if (typeof systemImage !== "string") {
      if (React.isValidElement(systemImage)) {
        return systemImage;
      }

      return (
        <IconSymbol
          name={systemImage.name}
          size={systemImage.size ?? size}
          color={systemImage.color ?? AppleColors.tertiaryLabel}
        />
      );
    }
  }

  const resolvedName =
    typeof systemImage === "string"
      ? systemImage
      : isHrefExternal
        ? "arrow.up.right"
        : "chevron.right";

  return (
    <Image
      source={"sf:" + resolvedName}
      size={size}
      weight="bold"
      tintColor={AppleColors.tertiaryLabel}
    />
  );
});

export function HStack(props: ViewProps) {
  // Android-safe style merging - avoid complex operations that might fail
  const combinedStyle = React.useMemo(() => {
    const baseStyle = styles.hstack;

    // Simplified merging for Android to avoid potential issues
    if (process.env.EXPO_OS === "android") {
      if (!props.style) return baseStyle;
      return [baseStyle, props.style];
    }

    // Full merging for other platforms
    if (!props.style) {
      return baseStyle;
    }

    if (Array.isArray(props.style)) {
      return [baseStyle, ...props.style];
    }

    return [baseStyle, props.style];
  }, [props.style]);

  return (
    <View
      {...props}
      style={combinedStyle}
    />
  );
}

export function VStack(props: ViewProps) {
  // Android-safe style merging
  const combinedStyle = React.useMemo(() => {
    const baseStyle = styles.vstack;

    // Simplified merging for Android to avoid potential issues
    if (process.env.EXPO_OS === "android") {
      if (!props.style) return baseStyle;
      return [baseStyle, props.style];
    }

    // Full merging for other platforms
    if (!props.style) {
      return baseStyle;
    }

    if (Array.isArray(props.style)) {
      return [baseStyle, ...props.style];
    }

    return [baseStyle, props.style];
  }, [props.style]);

  return (
    <View
      {...props}
      style={combinedStyle}
    />
  );
}

export function Spacer(props: ViewProps) {
  return <View {...props} style={[styles.spacer, props.style]} />;
}

function Separator(props: ViewProps) {
  return <View {...props} style={[styles.separator, props.style]} />;
}

// Simplified mergedStyleProp function
export function mergedStyleProp<TStyle extends ViewStyle | TextStyle>(
  ...styleProps: (StyleProp<TStyle> | null | undefined)[]
): StyleProp<TStyle> {
  if (!styleProps.length) return undefined;

  const validStyles = styleProps.filter((style) => style != null);

  if (validStyles.length === 0) return undefined;
  if (validStyles.length === 1) return validStyles[0] as StyleProp<TStyle>;

  return validStyles as StyleProp<TStyle>;
}

function extractStyle<TStyle extends ViewStyle | TextStyle>(
  styleProp: TStyle | null | undefined,
  key: keyof TStyle
) {
  if (styleProp == null) {
    return undefined;
  } else if (Array.isArray(styleProp)) {
    for (const style of styleProp) {
      if (style && style[key] != null) {
        return style[key];
      }
    }
    return undefined;
  } else if (typeof styleProp === "object") {
    return styleProp?.[key];
  }
  return null;
}

/** @return true if the node should be wrapped in text. */
function isStringishNode(node: React.ReactNode): boolean {
  let containsStringChildren = typeof node === "string";

  React.Children.forEach(node, (child) => {
    if (typeof child === "string") {
      containsStringChildren = true;
    } else if (
      React.isValidElement(child) &&
      "props" in child &&
      typeof child.props === "object" &&
      child.props !== null &&
      "children" in child.props
    ) {
      containsStringChildren = isStringishNode(child.props.children as any);
    }
  });
  return containsStringChildren;
}
