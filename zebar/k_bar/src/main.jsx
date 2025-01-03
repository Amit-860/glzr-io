import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
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
				return <i className="nf nf-md-ethernet_cable" />;
			case "wifi":
				if (networkOutput.defaultGateway?.signalStrength >= 80) {
					return <i className="nf nf-md-wifi_strength_4" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 65) {
					return <i className="nf nf-md-wifi_strength_3" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 40) {
					return <i className="nf nf-md-wifi_strength_2" />;
				}
				if (networkOutput.defaultGateway?.signalStrength >= 25) {
					return <i className="nf nf-md-wifi_strength_1" />;
				}
				return <i className="nf nf-md-wifi_strength_outline" />;
			default:
				return <i className="nf nf-md-wifi_strength_off_outline" />;
		}
	}

	// Get icon to show for how much of the battery is charged.
	function getBatteryIcon(batteryOutput) {
		if (batteryOutput.chargePercent > 90) {
			return <i className="nf nf-fa-battery_4" />;
		}
		if (batteryOutput.chargePercent > 70) {
			return <i className="nf nf-fa-battery_3" />;
		}
		if (batteryOutput.chargePercent > 40) {
			return <i className="nf nf-fa-battery_2" />;
		}
		if (batteryOutput.chargePercent > 20) {
			return <i className="nf nf-fa-battery_1" />;
		}
		return <i className="nf nf-fa-battery_0" />;
	}

	// Get icon to show for current weather status.
	function getWeatherIcon(weatherOutput) {
		switch (weatherOutput.status) {
			case "clear_day":
				return <i className="nf nf-weather-day_sunny" />;
			case "clear_night":
				return <i className="nf nf-weather-night_clear" />;
			case "cloudy_day":
				return <i className="nf nf-weather-day_cloudy" />;
			case "cloudy_night":
				return <i className="nf nf-weather-night_alt_cloudy" />;
			case "light_rain_day":
				return <i className="nf nf-weather-day_sprinkle" />;
			case "light_rain_night":
				return <i className="nf nf-weather-night_alt_sprinkle" />;
			case "heavy_rain_day":
				return <i className="nf nf-weather-day_rain" />;
			case "heavy_rain_night":
				return <i className="nf nf-weather-night_alt_rain" />;
			case "snow_day":
				return <i className="nf nf-weather-day_snow" />;
			case "snow_night":
				return <i className="nf nf-weather-night_alt_snow" />;
			case "thunder_day":
				return <i className="nf nf-weather-day_lightning" />;
			case "thunder_night":
				return <i className="nf nf-weather-night_alt_lightning" />;
		}
	}

	function getMediaInformation(mediaOutput) {
		if (mediaOutput) {
			if (mediaOutput?.currentSession?.isPlaying) {
				return (
					<div className="media">
						<i
							className="nf nf-fa-pause"
							onClick={() => mediaOutput.togglePlayPause()}
						/>
						<div className="mediaInfo">
							{" "}
							{mediaOutput.currentSession.title}{" "}
						</div>
					</div>
				);
			} else {
				return (
					<div className="media">
						<i
							className="nf nf-fa-play"
							onClick={() => mediaOutput.togglePlayPause()}
						/>
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
				<i className="logo nf nf-fa-windows" />
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
							className={`tiling-direction nf ${
								output.glazewm.tilingDirection === "horizontal"
									? "nf-md-swap_horizontal"
									: "nf-md-swap_vertical"
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
					<i className="nf nf-cod-calendar" />
					{output.date?.formatted.slice(0, 11)}
				</div>
				<div className="time">
					<i className="nf nf-oct-clock" />
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
								<i className="outicon nf nf-weather-direction_up" />
								{output.network.traffic?.transmitted.siValue +
									" " +
									output.network.traffic?.transmitted.siUnit}
							</div>
						)}
					{output.network && output.network.traffic?.received.siValue > 0 && (
						<div className="incomming">
							<i className="inicon nf nf-weather-direction_down" />
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
						<i className="nf nf-fae-chip" />
						{Math.round(output.memory.usage)}%
					</div>
				)}

				{output.cpu && (
					<div className="cpu">
						<i className="nf nf-oct-cpu" />

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
							<i className="nf nf-fa-volume_xmark" />
						) : (
							<i className="nf nf-fa-volume_up" />
						)}
						{Math.round(output.audio.defaultPlaybackDevice.volume)}%
					</div>
				)}

				{output.battery && (
					<div className="battery">
						{/* Show icon for whether battery is charging. */}
						{output.battery.isCharging && (
							<i className="nf nf-md-power_plug charging-icon" />
						)}
						{getBatteryIcon(output.battery)}
						{Math.round(output.battery.chargePercent)}%
					</div>
				)}
			</div>
		</div>
	);
}
