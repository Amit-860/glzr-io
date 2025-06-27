import { useEffect, useState } from "react";
import * as zebar from "zebar";
import { Center } from "./components/Center";
import { Chip } from "./components/common/Chip";
import Media from "./components/media";
import Stat from "./components/stat";
import { weatherThresholds } from "./components/stat/defaults/thresholds";
import { TilingControl } from "./components/TilingControl";
import VolumeControl from "./components/volume";
import { WorkspaceControls } from "./components/WorkspaceControls";
import { WindowTitle } from "./components/windowTitle/WindowTitle";
import "./styles/fonts.css";
import { useAutoTiling } from "./utils/useAutoTiling";
import { getWeatherIcon } from "./utils/weatherIcons";
import "remixicon/fonts/remixicon.css";

const providers = zebar.createProviderGroup({
	media: { type: "media" },
	network: { type: "network", refreshInterval: 2000 },
	glazewm: { type: "glazewm" },
	cpu: { type: "cpu" },
	date: { type: "date", formatting: "EEE d MMM t", locale: "en-GB" },
	memory: { type: "memory" },
	weather: { type: "weather" },
	audio: { type: "audio" },
	systray: { type: "systray" },
	battery: { type: "battery" },
});

function App() {
	const [output, setOutput] = useState(providers.outputMap);
	const [isStatsChipHovered, setIsStatsChipHovered] = useState(false);
	useEffect(() => {
		providers.onOutput(() => setOutput(providers.outputMap));
	}, []);

	function getNetworkIcon(networkOutput: any) {
		switch (networkOutput.defaultInterface?.type) {
			case "ethernet":
				return <i className="ri-router-fill" />;
			case "wifi":
				if (networkOutput.defaultGateway?.signalStrength >= 80) {
					return <i className="ri-signal-wifi-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 65) {
					return <i className="ri-signal-wifi-3-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 40) {
					return <i className="ri-signal-wifi-2-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 25) {
					return <i className="ri-signal-wifi-1-fill" />;
				}
				return <i className="nf nf-md-wifi_strength_outline" />;
			default:
				return <i className="ri-signal-wifi-off-fill" />;
		}
	}

	function formatNumber(num: number): number {
		// Check if the number is a floating-point number
		if (num % 1 !== 0) {
			return Math.round(num * 10) / 10;
		}
		return num;
	}

	function NetworkTrafficChip({ output }: any): any {
		const { transmitted, received } = output?.network?.traffic || {};

		const hasTraffic = transmitted?.siValue > 0 || received?.siValue > 0;

		if (!hasTraffic) {
			return null;
		}

		return (
			<div className="flex items-center h-full">
				<Chip
					as="button"
					className="flex items-center gap-1 h-full text-icon"
				>
					{transmitted && (
						<div className="outgoing">
							<i className="ri-arrow-up-fill" />
							{`${formatNumber(transmitted.siValue)} ${
								transmitted.siUnit
							}`}
						</div>
					)}

					{received && (
						<div className="incomming">
							<i className="ri-arrow-down-fill" />
							{`${formatNumber(received.siValue)} ${
								received.siUnit
							}`}
						</div>
					)}
				</Chip>
			</div>
		);
	}

	const ventuskyUrl = "https://www.ventusky.com/ranchi";

	const handleOpenInNewWindow = (url: string) => {
		const windowFeatures = "width=1200,height=800,resizable,scrollbars";
		window.open(url, "_blank", windowFeatures);
	};

	useAutoTiling();

	const statIconClassnames = "h-3 w-3 text-icon";

	return (
		<div className="relative flex justify-between items-center bg-background/80 border border-button-border/80 backdrop-blur-3xl text-text h-full antialiased select-none rounded-lg font-mono py-[3px]">
			<div className="flex items-center gap-2 h-full z-10 pl-[3px]">
				<div className="flex items-center gap-1.5 h-full">
					<TilingControl glazewm={output.glazewm} />
				</div>
				<div className="flex items-center gap-2 h-full">
					<WorkspaceControls glazewm={output.glazewm} />
				</div>
				<div className="flex items-center justify-center gap-2 h-full">
					<Media media={output.media} />
				</div>
			</div>

			<div className="absolute w-full h-full flex items-center justify-center left-0">
				<Center>
					<WindowTitle glazewm={output.glazewm} />
				</Center>
			</div>

			<div className="flex gap-2 items-center h-full z-10">
				{<NetworkTrafficChip output={output} />}

				<div className="flex items-center h-full">
					<Chip
						className="flex items-center gap-3 h-full text-icon"
						as="button"
					>
						{output.network && (
							<div className="network">
								{getNetworkIcon(output.network)}{" "}
								{output.network.defaultGateway
									? output.network.defaultGateway?.ssid
									: "No Signal"}
							</div>
						)}
					</Chip>
				</div>

				<div className="flex items-center h-full">
					{/* TODO: Extract to component */}
					<Chip
						className="flex items-center gap-3 h-full w-[11rem] justify-between"
						as="button"
						onMouseEnter={() => setIsStatsChipHovered(true)}
						onMouseLeave={() => setIsStatsChipHovered(false)}
						onClick={() => {
							output.glazewm?.runCommand("shell-exec taskmgr");
						}}
					>
						{output.cpu && (
							<Stat
								Icon={
									<p className="font-medium text-icon">CPU</p>
								}
								stat={`${Math.round(output.cpu.usage)}%`}
								type={isStatsChipHovered ? "inline" : "ring"}
							/>
						)}

						{output.memory && (
							<Stat
								Icon={
									<p className="font-medium text-icon">RAM</p>
								}
								stat={`${Math.round(output.memory.usage)}%`}
								type={isStatsChipHovered ? "inline" : "ring"}
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
								type={isStatsChipHovered ? "inline" : "ring"}
							/>
						)}
					</Chip>
				</div>

				<div className="flex items-center h-full">
					<VolumeControl
						playbackDevice={output.audio?.defaultPlaybackDevice}
						setVolume={output.audio?.setVolume}
						statIconClassnames={statIconClassnames}
					/>
				</div>

				<div className="flex items-center h-full">
					<Chip
						className="flex items-center gap-3 h-full"
						as="button"
						onClick={() => handleOpenInNewWindow(ventuskyUrl)}
					>
						{output.weather && (
							<Stat
								Icon={getWeatherIcon(
									output.weather,
									statIconClassnames
								)}
								stat={`${Math.round(
									output.weather.celsiusTemp
								)}°C`}
								threshold={weatherThresholds}
								type="inline"
							/>
						)}
					</Chip>
				</div>

				{/* <div className="h-full flex items-center px-0.5 pr-1">
					<Systray systray={output.systray} />
				</div> */}

				<div className="h-full flex items-center justify-center pr-[3px]">
					{/* {output?.date?.formatted ??
						new Intl.DateTimeFormat("en-GB", {
							weekday: "short", // EEE
							day: "numeric", // d
							month: "short", // MMM
							hour: "numeric", // t (hour part)
							minute: "numeric", // t (minute part)
							hour12: true, // 12 hour format
						})
							.format(new Date())
							.replace(/,/g, "")} */}

					<div className="flex items-center h-full">
						<Chip
							className="flex items-center gap-3 h-full"
							as="button"
						>
							{output.date?.formatted.slice(0, 11)}
							{" | "}
							{output.date?.formatted.slice(11)}
						</Chip>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
