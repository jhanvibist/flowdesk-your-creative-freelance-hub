import { ReactNode } from "react";

interface EmptyStateProps {
  image?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ image, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in">
      {image && (
        <img
          src={image}
          alt=""
          className="w-48 h-auto md:w-64 mb-6 opacity-90 animate-float"
          loading="lazy"
        />
      )}
      <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
};
