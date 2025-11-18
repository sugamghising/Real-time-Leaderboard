/**
 * Card Component
 * Reusable container card
 */

import type { BaseComponentProps } from "../../types";

interface CardProps extends BaseComponentProps {
  title?: string;
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const Card = ({
  children,
  className = "",
  title,
  padding = "md",
  onClick,
}: CardProps) => {
  const paddingStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md ${paddingStyles[padding]} ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      } ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
};
