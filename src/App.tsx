import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import ThemeSwitch from "./components/ThemeSwitch";
import CalculatorModeSwitch, {
	CalculatorMode,
} from "./components/CalculatorModeSwitch";
import ComputationModeSwitch, {
	ComputationMode,
} from "./components/ComputationModeSwitch";
import ModernCalculator from "./components/ModernCalculator";
import LatinHonorsCalculator from "./components/LatinHonorsCalculator";
import SaveCopyControls from "./components/SaveCopyControls";
import Input from "./components/Input";
import FloatingChatButton from "./components/FloatingChatButton";
import FloatingFaqButton from "./components/FloatingFaqButton";
import ScheduledJosePeek from "./components/ScheduledJosePeek";
import SupportModal from "./components/SupportModal";
import { GWA } from "./model";
import { calculateSummary } from "./gwaCalculator.mjs";
import {
	loadCalculatorData,
	loadCalculatorPreferences,
	saveCalculatorData,
	saveCalculatorPreferences,
} from "./calculatorSave.mjs";
import { getNextScholarshipCourseId, transferScholarshipCourses } from "./latinHonors.mjs";
import type { LatinHonorsCourse, LatinTerm } from "./latinHonors.mjs";
import { initializeGoogleAnalytics } from "./googleAnalytics";

const AdminPage = lazy(() => import("./components/AdminPage"));
const EMPTY_SCHOLARSHIP_COURSE: GWA = { id: 0, grades: 0, units: 0 };
const GWA_GUIDE_URL = `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/how-to-compute-gwa/`;

const readInitialCalculatorState = () => {
	try {
		return {
			...loadCalculatorData(window.localStorage),
			...loadCalculatorPreferences(window.localStorage),
			storageMessage: "",
			loadError: false,
		};
	} catch (error) {
		console.warn("Could not read saved calculator data:", error);
		return {
			scholarshipCourses: [EMPTY_SCHOLARSHIP_COURSE],
			latinHonorsCourses: [],
			mode: "original" as CalculatorMode,
			computationMode: "scholarship" as ComputationMode,
			storageMessage: "Saved grades could not be read. New changes can still be saved in this browser.",
			loadError: true,
		};
	}
};

// Konami code: ↑↑↓↓←→←→BA — opens the admin page
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

function App() {
	const [initialState] = useState(readInitialCalculatorState);
	const [isDark, setIsDark] = useState(true);
	const [mode, setMode] = useState<CalculatorMode>(initialState.mode);
	const [computationMode, setComputationMode] = useState<ComputationMode>(initialState.computationMode);
	const [inputList, setInputList] = useState<GWA[]>(
		initialState.scholarshipCourses.length
			? initialState.scholarshipCourses
			: [{
				...EMPTY_SCHOLARSHIP_COURSE,
				id: getNextScholarshipCourseId(
					initialState.scholarshipCourses,
					initialState.latinHonorsCourses,
				),
			}],
	);
	const [latinHonorsCourses, setLatinHonorsCourses] = useState<LatinHonorsCourse[]>(initialState.latinHonorsCourses);
	const [latinPeriod, setLatinPeriod] = useState<{ year: number; term: LatinTerm }>({
		year: 1,
		term: "first",
	});
	const [storageMessage, setStorageMessage] = useState(initialState.storageMessage);
	const skipInitialDataSave = useRef(true);
	const [showModeHint, setShowModeHint] = useState(true);
	const [showAdmin, setShowAdmin] = useState(false);
	const [showSupport, setShowSupport] = useState(false);
	const closeSupport = useCallback(() => setShowSupport(false), []);

	const summary = calculateSummary(inputList);
	const showDelete = inputList.length > 1;

	useEffect(() => {
		if (skipInitialDataSave.current) {
			skipInitialDataSave.current = false;
			if (initialState.loadError) return;
		}

		try {
			saveCalculatorData(window.localStorage, {
				scholarshipCourses: inputList,
				latinHonorsCourses,
			});
			setStorageMessage("");
		} catch (error) {
			console.warn("Could not save calculator data:", error);
			setStorageMessage("Browser storage is unavailable. Your entries may not stay after you leave this page.");
		}
	}, [initialState.loadError, inputList, latinHonorsCourses]);

	useEffect(() => {
		try {
			saveCalculatorPreferences(window.localStorage, { mode, computationMode });
		} catch (error) {
			console.warn("Could not save calculator preferences:", error);
			setStorageMessage("Browser storage is unavailable. Your entries may not stay after you leave this page.");
		}
	}, [mode, computationMode]);

	const handleAddClick = () => {
		setInputList((previous) => {
			const nextId = getNextScholarshipCourseId(previous, latinHonorsCourses);
			return [...previous, { id: nextId, grades: 0, units: 0 }];
		});
	};

	const handleCourseChange = (
		id: number,
		field: "grades" | "units",
		value: number,
	) => {
		setInputList((previous) =>
			previous.map((course) =>
				course.id === id ? { ...course, [field]: value } : course,
			),
		);
	};

	const handleScholarshipCourseUpdate = (
		id: number,
		changes: Partial<Pick<GWA, "name" | "grades" | "units">>,
	) => {
		setInputList((previous) =>
			previous.map((course) =>
				course.id === id ? { ...course, ...changes } : course,
			),
		);
	};

	const handleCourseDelete = (id: number) => {
		setInputList((previous) => previous.filter((course) => course.id !== id));
	};

	const handleAddModernCourse = (course: Omit<GWA, "id">) => {
		setInputList((previous) => {
			const nextId = getNextScholarshipCourseId(previous, latinHonorsCourses);
			return [...previous, { id: nextId, ...course }];
		});
	};

	const handleClearAll = () => {
		setInputList((previous) => [{
			...EMPTY_SCHOLARSHIP_COURSE,
			id: getNextScholarshipCourseId(previous, latinHonorsCourses),
		}]);
	};

	const handleDemoData = () => {
		const demoCourses: Omit<GWA, "id">[] = [
			{ name: "Mathematics", grades: 1.25, units: 3 },
			{ name: "Biology", grades: 1.5, units: 4 },
			{ name: "English", grades: 1.75, units: 4 },
		];

		setInputList((previous) => {
			const firstId = getNextScholarshipCourseId(previous, latinHonorsCourses);
			return [
				...previous,
				...demoCourses.map((course, index) => ({
					id: firstId + index,
					...course,
				})),
			];
		});
	};

	const handleTransferCourses = (year: number, term: LatinTerm) => {
		const result = transferScholarshipCourses(inputList, latinHonorsCourses, year, term);
		setLatinHonorsCourses(result.courses);
		if (result.addedCount + result.updatedCount > 0) {
			setLatinPeriod({ year, term });
			setComputationMode("latin-honors");
		}
		return result;
	};

	useEffect(() => {
		initializeGoogleAnalytics();
	}, []);

	// Konami code listener — opens admin page
	useEffect(() => {
		let position = 0;
		const handler = (e: KeyboardEvent) => {
			const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
			if (key === KONAMI_CODE[position]) {
				position++;
				if (position === KONAMI_CODE.length) {
					position = 0;
					setShowAdmin(true);
				}
			} else {
				position = key === KONAMI_CODE[0] ? 1 : 0;
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return (
		<div
			className={`flex min-h-screen flex-col items-center duration-300 ${
				isDark
					? "bg-dark-background"
					: "bg-light-background"
			}`}>
			<div
				className={`w-full sm:w-1/2 md:w-3/4 lg:w-1/2 flex flex-col gap-6 p-4 sm:gap-8`}>
				{/* Headings */}
				<div className="flex flex-row items-start justify-between gap-2 sm:items-center">
					<div className="min-w-0">
						<h1
							className={`whitespace-nowrap text-lg font-semibold duration-300 sm:text-2xl ${
								isDark ? "text-dark-content" : "text-light-content"
							}`}>
							GWA Calculator
						</h1>
						{mode === "modern" && (
							<p
								className={`mt-1 text-xs sm:text-sm ${
									isDark ? "text-dark-content/60" : "text-light-content/60"
								}`}>
								Minimalist grade average computation
							</p>
						)}
					</div>
					<div className="flex shrink-0 flex-col items-end gap-2" data-nosnippet="">
						<CalculatorModeSwitch
							mode={mode}
							onChange={(nextMode) => {
								setMode(nextMode);
								if (nextMode === "modern") setShowModeHint(false);
							}}
							isDark={isDark}
							showNewModeHint={showModeHint}
						/>
						<ThemeSwitch setIsDark={setIsDark} isDark={isDark} />
					</div>
				</div>
				<div data-nosnippet="">
					<SaveCopyControls
						isDark={isDark}
						scholarshipCourses={inputList}
						latinHonorsCourses={latinHonorsCourses}
						storageMessage={storageMessage}
						onImport={(data) => {
							setInputList(data.scholarshipCourses);
							setLatinHonorsCourses(data.latinHonorsCourses);
							setStorageMessage("");
						}}
					/>
				</div>
				{mode === "modern" && (
					<div data-nosnippet="">
						<ComputationModeSwitch
							mode={computationMode}
							onChange={setComputationMode}
							isDark={isDark}
						/>
					</div>
				)}

				<div data-nosnippet="" className={computationMode === "scholarship" && mode === "modern" ? "" : "hidden"}>
					<ModernCalculator
						courses={inputList}
						summary={summary}
						isDark={isDark}
						onUpdateCourse={handleScholarshipCourseUpdate}
						onAddCourse={handleAddModernCourse}
						onDeleteCourse={handleCourseDelete}
						onClearAll={handleClearAll}
						onDemoData={handleDemoData}
						onTransferCourses={handleTransferCourses}
					/>
				</div>

				<div data-nosnippet="" className={mode === "original" ? "flex flex-col gap-8" : "hidden"}>
					<div
						className={`w-full rounded-xl p-10 duration-300 ${
							isDark ? "bg-dark-primary" : "bg-light-primary"
						}`}>
						<h2
							className={`flex justify-end text-5xl font-bold duration-300 ${
								isDark ? "text-dark-content" : "text-light-content"
							}`}>
							{summary.gwa.toFixed(4)}
						</h2>
						<span
							className={`mt-4 -mb-4 flex justify-end text-md opacity-30 duration-300 ${
								isDark ? "text-dark-content" : "text-light-content"
							}`}>
							{summary.academicStanding}
						</span>
					</div>

					<div
						className={`flex w-full flex-col rounded-xl p-10 duration-300 ${
							isDark ? "bg-dark-primary" : "bg-light-primary"
						}`}>
						<div className="flex flex-col gap-4">
							{inputList.map((input) => (
								<Input
									key={input.id}
									course={input}
									onChange={handleCourseChange}
									onDelete={handleCourseDelete}
									showDelete={showDelete}
									isDark={isDark}
								/>
							))}
						</div>

						<button
							type="button"
							className={`mt-8 rounded-lg px-3 py-2 text-lg duration-300 ${
								isDark
									? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
									: "bg-light-accent-1 text-light-accent-text hover:bg-light-accent-2"
							}`}
							onClick={handleAddClick}>
							Add
						</button>
					</div>
				</div>

				<div data-nosnippet="" className={mode === "modern" && computationMode === "latin-honors" ? "" : "hidden"}>
					<LatinHonorsCalculator
						isDark={isDark}
						courses={latinHonorsCourses}
						onCoursesChange={setLatinHonorsCourses}
						period={latinPeriod}
						onPeriodChange={setLatinPeriod}
					/>
				</div>
				<a
					href={GWA_GUIDE_URL}
					className={`text-center text-sm underline underline-offset-4 transition-opacity hover:opacity-80 ${
						isDark ? "text-dark-content/70" : "text-light-content/70"
					}`}>
					How to compute GWA in the Philippines
				</a>
			</div>

			<footer
				className={`duration-300 ${
					isDark ? "text-dark-content" : "text-light-content"
				} ${
					mode === "modern"
						? "mx-auto w-full sm:w-1/2 md:w-3/4 lg:w-1/2 px-4 py-4 text-right"
						: "mt-auto mx-auto w-full sm:w-1/2 md:w-3/4 lg:w-1/2 px-4 py-4 text-center"
				}`}>
				<span>
					GCalc is created and maintained by{" "}
					<a
						href="https://www.facebook.com/gabato.aaron30"
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-2">
						Aaron Jay Gabato
					</a>
					. {" "}
				</span>
				<button
					type="button"
					onClick={() => setShowSupport(true)}
					aria-haspopup="dialog"
					className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
					Buy me a Coffee! ☕
				</button>
			</footer>

			<ScheduledJosePeek />
			<FloatingFaqButton isDark={isDark} />
			<FloatingChatButton isDark={isDark} />
			{showSupport && (
				<SupportModal isDark={isDark} onClose={closeSupport} />
			)}
			{showAdmin && (
				<Suspense
					fallback={
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" role="status" aria-live="polite">
							<div className={`rounded-xl p-6 text-sm shadow-2xl ${isDark ? "bg-dark-primary text-dark-content" : "bg-light-primary text-light-content"}`}>
								Loading visitor analytics…
							</div>
						</div>
					}>
					<AdminPage
						onClose={() => setShowAdmin(false)}
						isDark={isDark}
					/>
				</Suspense>
			)}
		</div>
	);
}

export default App;
