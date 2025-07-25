import { motion } from "framer-motion";
import type { Workspace } from "glazewm";
import useMeasure from "react-use-measure";
import type { GlazeWmOutput } from "zebar";
import { cn } from "../utils/cn";
import { buttonStyles } from "./common/Button";
import { Chip } from "./common/Chip";

type WorkspaceControlsProps = {
	glazewm: GlazeWmOutput | null;
};
export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
	const [ref, { width }] = useMeasure();

	if (!glazewm) return;
	const workspaces = glazewm.currentWorkspaces;

	const springConfig = {
		type: "spring",
		stiffness: 120,
		damping: 20,
		mass: 0.8,
	};

	const handleWheel = (e: React.WheelEvent<HTMLButtonElement>) => {
		const delta = e.deltaY > 0 ? 1 : -1;
		const workspaceName = workspaces.indexOf(glazewm.focusedWorkspace);
		const newWorkspaceName = workspaces[workspaceName + delta]?.name;

		if (workspaces[workspaceName + delta]) {
			glazewm.runCommand(`focus --workspace ${newWorkspaceName}`);
		} else {
			const command =
				delta > 0 ? "focus --next-workspace" : "focus --prev-workspace";
			glazewm.runCommand(command);
		}
	};

	return (
		<motion.div
			key="workspace-control-panel"
			initial={{ width: 0, opacity: 0 }}
			animate={{ width: width || "auto", opacity: 1 }}
			exit={{ width: 0, opacity: 0 }}
			transition={springConfig}
			className="relative overflow-hidden h-full"
		>
			<Chip
				className={cn(
					width ? "absolute" : "relative",
					"flex items-center justify-center gap-1.5 select-none overflow-hidden px-[2px] py-[1px] h-full",
				)}
				as="div"
				ref={ref}
				onWheel={handleWheel}
			>
				{workspaces.map((workspace: Workspace) => {
					const isFocused = workspace.hasFocus;
					return (
						<button
							type="button"
							key={workspace.name}
							onClick={() =>
								glazewm.runCommand(`focus --workspace ${workspace.name}`)
							}
							className={cn(
								"relative rounded-xl px-2 transition-all duration-[0.7s] ease-out text-text-muted h-full",
								isFocused ? "" : "hover:text-text",
								isFocused && "px-5 text-text font-medium",
								// "px-4 text-text duration-900 transition-all ease-in-out font-medium",
							)}
							style={{
								WebkitTapHighlightColor: "transparent",
							}}
						>
							<p className={cn("z-10 pt-[1px]")}>
								{workspace.displayName ?? workspace.name}
							</p>

							{isFocused && (
								<motion.span
									layoutId="bubble"
									className={cn(
										buttonStyles,
										"bg-primary border-primary-border drop-shadow-sm rounded-[0.5rem] absolute inset-0 -z-10",
										isFocused && "hover:bg-primary",
									)}
									transition={{
										type: "spring",
										bounce: 0.2,
										duration: 0.6,
									}}
								/>
							)}
						</button>
					);
				})}
			</Chip>
		</motion.div>
	);
}
