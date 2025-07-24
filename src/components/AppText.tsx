import { Text } from "react-native";
import { cn } from "../utils/cn";
import * as AC from "@bacons/apple-colors";

type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary" | "label" | "systemBlue" | "white";
  center?: boolean;
  className?: string;
};

export function AppText({
  children,
  size = "medium",
  bold = false,
  color = "primary",
  center = false,
  className,
}: AppTextProps) {
  const getColorStyle = () => {
    switch (color) {
      case "primary":
        return { color: AC.label };
      case "secondary":
        return { color: AC.secondaryLabel };
      case "tertiary":
        return { color: AC.tertiaryLabel };
      case "label":
        return { color: AC.label };
      case "systemBlue":
        return { color: AC.systemBlue };
      case "white":
        return { color: AC.white };
      default:
        return { color: AC.label };
    }
  };

  return (
    <Text
      style={getColorStyle()}
      className={cn(
        size === "small" && "text-sm mb-2",
        size === "medium" && "text-base mb-3",
        size === "large" && "text-lg mb-4",
        size === "heading" && "text-xl mb-5",
        bold && "font-bold",
        center && "text-center",
        className,
      )}
    >
      {children}
    </Text>
  );
}
