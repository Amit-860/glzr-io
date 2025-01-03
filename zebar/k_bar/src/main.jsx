import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "remixicon/fonts/remixicon.css";
import * as zebar from "zebar";

createRoot(document.getElementById("root")).render(<App />);

const providers = zebar.createProviderGroup({
	network: { type: "network" },
	glazewm: { type: "glazewm" },
	cpu: { type: "cpu" },
	date: {
		type: "date",
		formatting: "EEE, dd MMM t",
	},
	battery: { type: "battery" },
	memory: { type: "memory" },
	weather: { type: "weather" },
	media: { type: "media" },
	audio: { type: "audio" },
});

function App() {
	const [output, setOutput] = useState(providers.outputMap);

	useEffect(() => {
		providers.onOutput(() => setOutput(providers.outputMap));
	}, []);

	// Get icon to show for current network status.
	function getNetworkIcon(networkOutput) {
		switch (networkOutput.defaultInterface?.type) {
			case "ethernet":
				return <i class="ri-router-fill"></i>;
			case "wifi":
				if (networkOutput.defaultGateway?.signalStrength >= 80) {
					return <i class="ri-signal-wifi-fill"></i>;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 65) {
					return <i class="ri-signal-wifi-3-fill"></i>;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 40) {
					return <i class="ri-signal-wifi-2-fill"></i>;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 25) {
					return <i class="ri-signal-wifi-1-fill"></i>;
				}
				return <i className="nf nf-md-wifi_strength_outline" />;
			default:
				return <i class="ri-signal-wifi-off-fill"></i>;
		}
	}

	// Get icon to show for how much of the battery is charged.
	function getBatteryIcon(batteryOutput) {
		if (batteryOutput.chargePercent > 90) {
			return <i class="ri-battery-fill"></i>;
		}
		if (batteryOutput.chargePercent > 70) {
			return <i class="ri-battery-low-fill"></i>;
		}
		if (batteryOutput.chargePercent > 40) {
			return <i class="ri-battery-low-line"></i>;
		}
		if (batteryOutput.chargePercent > 20) {
			return <i class="ri-battery-low-line"></i>;
		}
		return <i class="ri-battery-line"></i>;
	}

	// Get icon to show for current weather status.
	function getWeatherIcon(weatherOutput) {
		switch (weatherOutput.status) {
			case "clear_day":
				return <i class="ri-sun-fill"></i>;
			case "clear_night":
				return <i class="ri-moon-fill"></i>;
			case "cloudy_day":
				return <i class="ri-sun-cloudy-fill"></i>;
			case "cloudy_night":
				return <i class="ri-moon-cloudy-fill"></i>;
			case "light_rain_day":
				return <i class="ri-rainy-fill"></i>;
			case "light_rain_night":
				return <i class="ri-rainy-fill"></i>;
			case "heavy_rain_day":
				return <i class="ri-rainy-fill"></i>;
			case "heavy_rain_night":
				return <i class="ri-rainy-fill"></i>;
			case "snow_day":
				return <i class="ri-snowy-fill"></i>;
			case "snow_night":
				return <i class="ri-snowy-fill"></i>;
			case "thunder_day":
				<i class="ri-thunderstorms-fill"></i>;
			case "thunder_night":
				<i class="ri-thunderstorms-fill"></i>;
		}
	}

	function getMediaInformation(mediaOutput) {
		if (mediaOutput) {
			if (mediaOutput?.currentSession?.isPlaying) {
				return (
					<div className="media" onClick={() => mediaOutput.togglePlayPause()}>
						<i class="ri-pause-circle-line ri-2x"></i>
						<div className="mediaInfo">
							{" "}
							{mediaOutput.currentSession.title}{" "}
						</div>
					</div>
				);
			} else {
				return (
					<div className="media" onClick={() => mediaOutput.togglePlayPause()}>
						<i class="ri-play-circle-line ri-2x"></i>
						<div className="mediaInfo">
							{" "}
							{mediaOutput.currentSession.title}{" "}
						</div>
					</div>
				);
			}
		}
		return <></>;
	}

	const [prevVol, setPrevVol] = useState(0); // Initial color: white
	function toggleMute() {
		const currentVol = output.audio.defaultPlaybackDevice.volume;
		if (currentVol === 0) {
			output.audio.setVolume(prevVol);
		} else {
			output.audio.setVolume(0);
		}
		setPrevVol(() => currentVol);
	}

	return (
		<div className="app">
			<div className="left">
				<i class="ri-windows-fill" />
				{output.glazewm && (
					<div className="workspaces">
						{output.glazewm.currentWorkspaces.map((workspace) => (
							<button
								type="button"
								className={`workspace ${workspace.hasFocus && "focused"} ${
									workspace.isDisplayed && "displayed"
								}`}
								onClick={() =>
									output.glazewm.runCommand(
										`focus --workspace ${workspace.name}`,
									)
								}
								key={workspace.name}
							>
								{workspace.displayName ?? workspace.name}
							</button>
						))}
					</div>
				)}
				{output.glazewm && (
					<>
						{output.glazewm.bindingModes.map((bindingMode) => (
							<button
								type="button"
								className="binding-mode"
								key={bindingMode.name}
								onClick={() =>
									output.glazewm.runCommand(
										`wm-disable-binding-mode --name ${bindingMode.name}`,
									)
								}
							>
								{bindingMode.displayName ?? bindingMode.name}
							</button>
						))}

						<button
							type="button"
							className={`tiling-direction ${
								output.glazewm.tilingDirection === "horizontal"
									? "ri-arrow-left-right-fill"
									: "ri-arrow-up-down-fill"
							}`}
							onClick={() =>
								output.glazewm.runCommand("toggle-tiling-direction")
							}
						/>
					</>
				)}
				{output.media?.currentSession && getMediaInformation(output.media)}
			</div>

			<div className="center">
				<div className="date">
					<i class="ri-calendar-todo-fill" />
					{output.date?.formatted.slice(0, 11)}
				</div>
				<div className="time">
					<i class="ri-time-fill" />
					{output.date?.formatted.slice(12)}
				</div>
				{output.weather && (
					<div className="weather">
						{getWeatherIcon(output.weather)}
						{Math.round(output.weather.celsiusTemp)}°C
					</div>
				)}
			</div>

			<div className="right">
				<div className="traffic">
					{output.network &&
						output.network.traffic?.transmitted.siValue > 0 && (
							<div className="outgoing">
								<i class="ri-arrow-up-fill" />
								{output.network.traffic?.transmitted.siValue +
									" " +
									output.network.traffic?.transmitted.siUnit}
							</div>
						)}
					{output.network && output.network.traffic?.received.siValue > 0 && (
						<div className="incomming">
							<i class="ri-arrow-down-fill" />
							{output.network.traffic?.received.siValue +
								" " +
								output.network.traffic?.received.siUnit}
						</div>
					)}
				</div>

				{output.network && (
					<div className="network">
						{getNetworkIcon(output.network)}
						{output.network.defaultGateway?.ssid}
					</div>
				)}

				{output.memory && (
					<div className="memory">
						<i class="ri-ram-fill" />
						{Math.round(output.memory.usage)}%
					</div>
				)}

				{output.cpu && (
					<div className="cpu">
						<i class="ri-cpu-line" />
						{/* Change the text color if the CPU usage is high. */}
						<span className={output.cpu.usage > 85 ? "high-usage" : ""}>
							{Math.round(output.cpu.usage)}%
						</span>
					</div>
				)}

				{output.audio && (
					<div className="audio" onClick={() => toggleMute()}>
						{/* Show icon for audio when volume is 0 */}
						{output.audio.defaultPlaybackDevice.volume === 0 ? (
							<i class="ri-volume-mute-fill" />
						) : (
							<i class="ri-volume-up-fill" />
						)}
						{Math.round(output.audio.defaultPlaybackDevice.volume)}%
					</div>
				)}

				{output.battery && (
					<div className="battery">
						{/* Show icon for whether battery is charging. */}
						{output.battery.isCharging && <i class="ri-battery-charge-fill" />}
						{getBatteryIcon(output.battery)}
						{Math.round(output.battery.chargePercent)}%
					</div>
				)}
			</div>
		</div>
	);
}
