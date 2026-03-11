import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
                className
            )}
        >
            {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
            <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
            {action}
        </div>
    );
}
