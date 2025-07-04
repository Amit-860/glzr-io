import { motion, AnimatePresence } from "framer-motion";
import { AppWindowIcon } from "lucide-react";
import { forwardRef, useState } from "react";
import { GlazeWmOutput } from "zebar";
import { WindowControls } from "./components/WindowControls";

type WindowTitleProps = {
	glazewm: GlazeWmOutput | null;
};

export const WindowTitle = forwardRef<HTMLButtonElement, WindowTitleProps>(
	({ glazewm }, ref) => {
		if (!glazewm) return;
		const [show, setShow] = useState(false);

		const title = getWindowTitle(glazewm);
		const ANIMATION_EXIT_OFFSET = 3;

		return (
			<AnimatePresence mode="wait">
				<motion.button
					ref={ref}
					key={title ?? "default-icon"}
					initial={{ opacity: 0, y: -ANIMATION_EXIT_OFFSET }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: ANIMATION_EXIT_OFFSET }}
					transition={{ duration: 0.15, ease: "easeInOut" }}
					className="font-medium relative h-full flex items-center cu"
					title={title ?? "Focused Window"}
					onMouseEnter={() => setShow(true)}
					onMouseLeave={() => setShow(false)}
				>
					{title ?? <AppWindowIcon className="h-4 w-4 text-icon" />}
					<WindowControls
						glazewm={glazewm}
						show={show}
						setShow={setShow}
						parentRef={ref}
					/>
				</motion.button>
			</AnimatePresence>
		);
	}
);

export enum ContainerType {
	ROOT = "root",
	MONITOR = "monitor",
	WORKSPACE = "workspace",
	SPLIT = "split",
	WINDOW = "window",
}

const SPLIT_WINDOW_PROCESS_EXCLUSIONS = ["Spotify"];
const SPLIT_WINDOW_TITLE_REGEX = /[-—]/;

const getWindowTitle = (glazewm: GlazeWmOutput): string | null => {
	const focusedWorkspace = glazewm.focusedWorkspace;
	const focusedContainer = glazewm.focusedContainer;

	if (focusedContainer.type === ContainerType.WINDOW) {
		const focusedContainerTitle = focusedContainer.title;
		const focusedContainerProcess = focusedContainer.processName;

		const isExcluded =
			typeof focusedContainerProcess === "string" &&
			SPLIT_WINDOW_PROCESS_EXCLUSIONS.some((exclusion) =>
				focusedContainerProcess.startsWith(exclusion)
			);

		const splitWindowTitle =
			focusedContainerTitle?.split(SPLIT_WINDOW_TITLE_REGEX) || [];

		const lastSplitWindowTitle = isExcluded
			? focusedContainerProcess
			: splitWindowTitle.at(-1) ?? focusedContainerTitle;

		return lastSplitWindowTitle;
	}

	// If the focused container is not a window, return workspace displayName. If displayName is not available, fallback to workspace name.
	const focusedWorkspaceDisplayName = focusedWorkspace.displayName
		? focusedWorkspace.displayName
		: `Workspace ${focusedWorkspace.name}`;
	return focusedWorkspaceDisplayName;
};

const getWindowProcess = (glazewm: GlazeWmOutput): string | null => {
	const focusedContainer = glazewm.focusedContainer;

	if (focusedContainer.type === ContainerType.WINDOW) {
		return focusedContainer.processName;
	}

	return null;
};

export default WindowTitle;
