import React from "react";
import { cn } from "../../utils/cn";

interface ChipProps<T extends React.ElementType = "div"> {
	as?: T;
	className?: string;
	children: React.ReactNode;
	[key: string]: any;
}

export const Chip = React.forwardRef<HTMLElement, ChipProps>(
	({ as: Component = "div", className, children, ...props }, ref) => {
		return (
			<Component
				ref={ref}
				className={cn(
					"flex items-center justify-center gap-2 px-[6px] pt-[3px] pb-[2px] bg-background-deeper rounded-xl h-full drop-shadow-sm",
					"border border-border",
					"hover:border-button-border transition-colors ease-in-out duration-200",
					className
				)}
				{...props}
			>
				{children}
			</Component>
		);
	}
);

Chip.displayName = "Chip";
