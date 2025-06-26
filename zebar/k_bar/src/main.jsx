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
	function getAudioIcon(audioOutput) {
		if (audioOutput.defaultPlaybackDevice) {
			const volume = audioOutput.defaultPlaybackDevice?.volume;
			if (volume > 90) {
				return <i class="ri-megaphone-fill" />;
			}
			if (volume > 30) {
				return <i class="ri-volume-up-fill" />;
			}
			if (volume > 0) {
				return <i class="ri-volume-down-fill" />;
			}
			if (volume === 0) {
				return <i class="ri-volume-mute-fill" />;
			}
		}
		return <i class="ri-volume-off-vibrate-fill" />;
	}

	// Get icon to show for current network status.
	function getNetworkIcon(networkOutput) {
		switch (networkOutput.defaultInterface?.type) {
			case "ethernet":
				return <i class="ri-router-fill" />;
			case "wifi":
				if (networkOutput.defaultGateway?.signalStrength >= 80) {
					return <i class="ri-signal-wifi-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 65) {
					return <i class="ri-signal-wifi-3-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 40) {
					return <i class="ri-signal-wifi-2-fill" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 25) {
					return <i class="ri-signal-wifi-1-fill" />;
				}
				return <i className="nf nf-md-wifi_strength_outline" />;
			default:
				return <i class="ri-signal-wifi-off-fill" />;
		}
	}

	// Get icon to show for how much of the battery is charged.
	function getBatteryIcon(batteryOutput) {
		if (batteryOutput.chargePercent > 90) {
			return <i class="ri-battery-fill" />;
		}
		if (batteryOutput.chargePercent > 70) {
			return <i class="ri-battery-low-fill" />;
		}
		if (batteryOutput.chargePercent > 40) {
			return <i class="ri-battery-low-line" />;
		}
		if (batteryOutput.chargePercent > 20) {
			return <i class="ri-battery-low-line" />;
		}
		return <i class="ri-battery-line" />;
	}

	// Get icon to show for current weather status.
	function getWeatherIcon(weatherOutput) {
		switch (weatherOutput.status) {
			case "clear_day":
				return <i class="ri-sun-fill" />;
			case "clear_night":
				return <i class="ri-moon-fill" />;
			case "cloudy_day":
				return <i class="ri-sun-cloudy-fill" />;
			case "cloudy_night":
				return <i class="ri-moon-cloudy-fill" />;
			case "light_rain_day":
				return <i class="ri-rainy-fill" />;
			case "light_rain_night":
				return <i class="ri-rainy-fill" />;
			case "heavy_rain_day":
				return <i class="ri-rainy-fill" />;
			case "heavy_rain_night":
				return <i class="ri-rainy-fill" />;
			case "snow_day":
				return <i class="ri-snowy-fill" />;
			case "snow_night":
				return <i class="ri-snowy-fill" />;
			case "thunder_day":
				return <i class="ri-thunderstorms-fill" />;
			case "thunder_night":
				return <i class="ri-thunderstorms-fill" />;
		}
	}

	const [ind, setInd] = useState(0);
	function incInd() {
		setInd(() => {
			const sessions = output.media?.allSessions;
			if (sessions) {
				if (sessions.length - 1 === ind) {
					return 0;
				}
				return ind + 1;
			}
			return 0;
		});
	}
	function decInd() {
		setInd(() => {
			const sessions = output.media?.allSessions;
			if (sessions) {
				if (ind === 0) {
					return sessions.length - 1;
				}
				return ind - 1;
			}
			return 0;
		});
	}

	function getMediaInformation() {
		if (output.media?.currentSession) {
			const currentSession = output.media.currentSession;
			return (
				<div
					className="media"
					onClick={() => {
						output.media.togglePlayPause();
					}}
					onKeyUp={() => {}}
				>
					{currentSession?.isPlaying ? (
						<i class="ri-pause-circle-line ri-2x" />
					) : (
						<i class="ri-play-circle-line ri-2x" />
					)}
					<div className="mediaInfo"> {currentSession?.title} </div>
				</div>
			);
		} else {
			return <></>;
		}

		// if (mediaSession?.[ind]) {
		// 	return (
		// 		<div
		// 			className="media"
		// 			onClick={() =>
		// 				output.media.togglePlayPause({
		// 					sessionId: mediaSession[ind].sessionId,
		// 				})
		// 			}
		// 			onKeyUp={() => {}}
		// 		>
		// 			{mediaSession[ind].isPlaying ? (
		// 				<i class="ri-pause-circle-line ri-2x" />
		// 			) : (
		// 				<i class="ri-play-circle-line ri-2x" />
		// 			)}
		// 			<div className="mediaInfo"> {mediaSession[ind].title} </div>
		// 		</div>
		// 	);
		// }
	}

	const [prevVol, setPrevVol] = useState(0);
	function toggleMute() {
		const currentVol = output.audio?.defaultPlaybackDevice?.volume;
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
				<i class="logo ri-windows-fill" />
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
				{output.media && getMediaInformation()}
				{/* <button type="button" onClick={() => incInd()}>
					+
				</button>
				<button type="button" onClick={() => decInd()}>
					-
				</button> */}
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
								{`${output.network.traffic?.transmitted.siValue} ${output.network.traffic?.transmitted.siUnit}`}
							</div>
						)}
					{output.network && output.network.traffic?.received.siValue > 0 && (
						<div className="incomming">
							<i class="ri-arrow-down-fill" />
							{`${output.network.traffic?.received.siValue} ${output.network.traffic?.received.siUnit}`}
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
					<div
						className="audio"
						onClick={() => toggleMute()}
						onKeyUp={() => {}}
					>
						{/* Show icon for audio when volume is 0 */}
						{getAudioIcon(output.audio)}
						{Math.round(output.audio?.defaultPlaybackDevice?.volume)}%
					</div>
				)}

				{output.battery && (
					<div className="battery">
						{/* Show icon for whether battery is charging. */}
						{output.battery.isCharging ? (
							// <i class="ri-battery-charge-fill" />
							<i class="ri-plug-fill" />
						) : (
							getBatteryIcon(output.battery)
						)}
						{Math.round(output.battery.chargePercent)}%
					</div>
				)}
			</div>
		</div>
	);
}
