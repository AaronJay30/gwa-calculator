declare global {
	interface Window {
		dataLayer?: IArguments[];
		gtag?: (...args: unknown[]) => void;
	}
}

let initializedMeasurementId: string | null = null;

export const isValidGoogleAnalyticsMeasurementId = (
	measurementId: string | undefined,
): measurementId is string =>
	Boolean(measurementId && /^G-[A-Z0-9]+$/i.test(measurementId.trim()));

export const initializeGoogleAnalytics = (): void => {
	const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
	if (
		!import.meta.env.PROD ||
		typeof window === "undefined" ||
		!isValidGoogleAnalyticsMeasurementId(measurementId) ||
		initializedMeasurementId === measurementId
	) {
		return;
	}

	initializedMeasurementId = measurementId;
	window.dataLayer = window.dataLayer ?? [];
	window.gtag = function gtag() {
		// Match Google's documented queue format for gtag commands.
		// eslint-disable-next-line prefer-rest-params
		window.dataLayer?.push(arguments);
	};
	window.gtag("js", new Date());
	window.gtag("config", measurementId);

	const script = document.createElement("script");
	script.async = true;
	script.dataset.ga4MeasurementId = measurementId;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
	document.head.appendChild(script);
};
