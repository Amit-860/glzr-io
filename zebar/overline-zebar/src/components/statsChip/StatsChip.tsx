import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chip } from "../common/Chip";
import Stat from "../stat";

interface StatsChipProps {
	output: any; // You might want to define a more specific type for output
}

const ANIMATION_EXIT_OFFSET = 3;

export function StatsChip({ output }: StatsChipProps) {
	const [show, setShow] = useState(false);
	const [isStatsChipHovered, setIsStatsChipHovered] = useState(false);

	return (
		<motion.button
			ref={null}
			key={null}
			className="font-medium relative h-full flex items-center cu"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			<AnimatePresence mode="wait">
				{/* First Chip: Shows when not hovered */}
				{!show && (
					<motion.div
						key="ring-chip"
						initial={{
							opacity: 0,
							y: -ANIMATION_EXIT_OFFSET,
						}}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: ANIMATION_EXIT_OFFSET,
						}}
						transition={{
							duration: 0.15,
							ease: "easeInOut",
						}}
					>
						<Chip
							className="flex items-center gap-3 h-full w-[11rem] justify-between"
							as="button"
							onMouseEnter={() => setIsStatsChipHovered(true)}
							onMouseLeave={() => setIsStatsChipHovered(false)}
							onClick={() => {
								output.glazewm?.runCommand(
									"shell-exec taskmgr"
								);
							}}
						>
							{output.cpu && (
								<Stat
									Icon={
										<p className="font-medium text-icon">
											CPU
										</p>
									}
									stat={`${Math.round(output.cpu.usage)}%`}
									type={"ring"}
								/>
							)}

							{output.memory && (
								<Stat
									Icon={
										<p className="font-medium text-icon">
											RAM
										</p>
									}
									stat={`${Math.round(output.memory.usage)}%`}
									type={"ring"}
								/>
							)}

							{output.battery && (
								<Stat
									Icon={
										output.battery.isCharging ? (
											<p className="font-medium text-teal-700">
												BTT
											</p>
										) : (
											<p className="font-medium text-icon">
												BTT
											</p>
										)
									}
									stat={`${Math.round(
										output.battery.chargePercent
									)}%`}
									type={"ring"}
								/>
							)}
						</Chip>
					</motion.div>
				)}

				{/* Second Chip: Shows when hovered */}
				{show && (
					<motion.div
						key="inline-chip"
						initial={{
							opacity: 0,
							y: -ANIMATION_EXIT_OFFSET,
						}}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: ANIMATION_EXIT_OFFSET,
						}}
						transition={{
							duration: 0.15,
							ease: "easeInOut",
						}}
					>
						<Chip
							className="flex items-center gap-3 h-full w-[11rem] justify-between"
							as="button"
							onMouseEnter={() => setIsStatsChipHovered(true)}
							onMouseLeave={() => setIsStatsChipHovered(false)}
							onClick={() => {
								output.glazewm?.runCommand(
									"shell-exec taskmgr"
								);
							}}
						>
							{output.cpu && (
								<Stat
									Icon={
										<p className="font-medium text-icon">
											CPU
										</p>
									}
									stat={`${Math.round(output.cpu.usage)}%`}
									type={"inline"}
								/>
							)}

							{output.memory && (
								<Stat
									Icon={
										<p className="font-medium text-icon">
											RAM
										</p>
									}
									stat={`${Math.round(output.memory.usage)}%`}
									type={"inline"}
								/>
							)}

							{output.battery && (
								<Stat
									Icon={
										output.battery.isCharging ? (
											<p className="font-medium text-teal-700">
												BTT
											</p>
										) : (
											<p className="font-medium text-icon">
												BTT
											</p>
										)
									}
									stat={`${Math.round(
										output.battery.chargePercent
									)}%`}
									type={"inline"}
								/>
							)}
						</Chip>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.button>
	);
}
