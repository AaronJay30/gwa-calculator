import { lazy, Suspense, useCallback, useEffect, useState } from "react";
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
import Input from "./components/Input";
import FloatingChatButton from "./components/FloatingChatButton";
import SupportModal from "./components/SupportModal";
import { GWA } from "./model";
import { calculateSummary } from "./gwaCalculator.mjs";
import { recordVisit } from "./firebase/visitorService";

const AdminPage = lazy(() => import("./components/AdminPage"));

// Konami code: ↑↑↓↓←→←→BA — opens the admin page
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

function App() {
	const [isDark, setIsDark] = useState(true);
	const [mode, setMode] = useState<CalculatorMode>("original");
	const [computationMode, setComputationMode] = useState<ComputationMode>("scholarship");
	const [showModeHint, setShowModeHint] = useState(true);
	const [showAdmin, setShowAdmin] = useState(false);
	const [showSupport, setShowSupport] = useState(false);
	const closeSupport = useCallback(() => setShowSupport(false), []);

	const [inputList, setInputList] = useState<GWA[]>([
		{ id: 0, grades: 0.0, units: 0 },
	]);
	const summary = calculateSummary(inputList);
	const showDelete = inputList.length > 1;

	const handleAddClick = () => {
		setInputList((previous) => {
			const nextId = Math.max(-1, ...previous.map((course) => course.id)) + 1;
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

	const handleCourseDelete = (id: number) => {
		setInputList((previous) => previous.filter((course) => course.id !== id));
	};

	const handleAddModernCourse = (course: Omit<GWA, "id">) => {
		setInputList((previous) => {
			const nextId = Math.max(-1, ...previous.map((item) => item.id)) + 1;
			return [...previous, { id: nextId, ...course }];
		});
	};

	const handleClearAll = () => {
		setInputList([{ id: 0, grades: 0, units: 0 }]);
	};

	const handleDemoData = () => {
		const demoCourses: Omit<GWA, "id">[] = [
			{ name: "Mathematics", grades: 1.25, units: 3 },
			{ name: "Biology", grades: 1.5, units: 4 },
			{ name: "English", grades: 1.75, units: 4 },
		];

		setInputList((previous) => {
			const firstId = Math.max(-1, ...previous.map((item) => item.id)) + 1;
			return [
				...previous,
				...demoCourses.map((course, index) => ({
					id: firstId + index,
					...course,
				})),
			];
		});
	};

	// Record a visit once on mount
	useEffect(() => {
		recordVisit().catch((err) => {
			console.error("Failed to record visit:", err);
		});
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
			className={`${
				mode === "modern"
					? "flex min-h-screen flex-col items-center"
					: "flex min-h-screen items-center justify-center"
			} duration-300 ${
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
					<div className="flex shrink-0 flex-col items-end gap-2">
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
				{mode === "modern" && (
					<ComputationModeSwitch
						mode={computationMode}
						onChange={setComputationMode}
						isDark={isDark}
					/>
				)}

				<div className={computationMode === "scholarship" && mode === "modern" ? "" : "hidden"}>
					<ModernCalculator
						courses={inputList}
						summary={summary}
						isDark={isDark}
						onAddCourse={handleAddModernCourse}
						onDeleteCourse={handleCourseDelete}
						onClearAll={handleClearAll}
						onDemoData={handleDemoData}
					/>
				</div>

				<div className={mode === "original" ? "flex flex-col gap-8" : "hidden"}>
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

				<div className={mode === "modern" && computationMode === "latin-honors" ? "" : "hidden"}>
					<LatinHonorsCalculator isDark={isDark} />
				</div>
			</div>

			<footer
				className={`duration-300 ${
					isDark ? "text-dark-content" : "text-light-content"
				} ${
					mode === "modern"
						? "mx-auto w-full sm:w-1/2 md:w-3/4 lg:w-1/2 px-4 py-4 text-right"
						: "fixed bottom-4 right-4"
				}`}>
			<button
				type="button"
				onClick={() => setShowSupport(true)}
				aria-haspopup="dialog"
				className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
					© Aaron Jay Gabato. Buy me a Coffee! ☕
			</button>
			</footer>

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
					<AdminPage onClose={() => setShowAdmin(false)} isDark={isDark} />
				</Suspense>
			)}
		</div>
	);
}

export default App;
