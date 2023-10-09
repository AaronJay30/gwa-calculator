import { useEffect, useState } from "react";
import "./App.css";
import ThemeSwitch from "./components/ThemeSwitch";
import Input from "./components/Input";
import { GWA } from "./model";

function App() {
	const [result, setResult] = useState(0);
	const [academic, setAcademic] = useState("");
	const [showDelete, setShowDelete] = useState(false);
	const [isDark, setIsDark] = useState(true);

	const [inputList, setInputList] = useState<GWA[]>([
		{ id: 0, grades: 0.0, units: 0 },
	]);

	const handleAddClick = () => {
		// Calculate the next id value
		const nextId =
			inputList.length > 0 ? inputList[inputList.length - 1].id + 1 : 0;

		// Add a new item with the calculated id
		setInputList([...inputList, { id: nextId, grades: 0.0, units: 0 }]);
	};

	useEffect(() => {
		inputList.length > 1 ? setShowDelete(true) : setShowDelete(false);

		let totalGrades = 0;
		let totalUnits = 0;
		inputList.forEach((input) => {
			totalGrades += input.grades * input.units;
			totalUnits += input.units;
		});
		const computedResult =
			totalUnits !== 0
				? parseFloat((totalGrades / totalUnits).toFixed(4))
				: 0.0;

		setResult(computedResult);

		if (computedResult <= 1.5 && totalUnits > 10) {
			setAcademic("University Scholar");
		} else if (
			computedResult >= 1.51 &&
			computedResult <= 1.75 &&
			totalUnits > 10
		) {
			setAcademic("College Scholar");
		} else if (
			computedResult >= 1.76 &&
			computedResult <= 2.0 &&
			totalUnits > 10
		) {
			setAcademic("Dean's Lister");
		} else {
			setAcademic("");
		}
	}, [inputList, inputList.length]);

	return (
		<div
			className={`flex min-h-screen justify-center items-center duration-300 ${
				isDark ? "bg-dark-background" : "bg-light-background"
			}`}>
			<div className="w-full sm:w-1/2 md:w-3/4 lg:w-1/2 flex p-4 rounded-lg flex-col gap-8">
				{/* Headings */}
				<div className="flex flex-row justify-between">
					<h1
						className={`text-2xl font-semibold duration-300 ${
							isDark ? "text-dark-content" : "text-light-content"
						}`}>
						GWA Calculator
					</h1>
					<ThemeSwitch setIsDark={setIsDark} isDark={isDark} />
				</div>

				{/* Result Section */}
				<div
					className={`w-full p-10 rounded-xl duration-300 ${
						isDark ? "bg-dark-primary" : "bg-light-primary"
					}`}>
					<h1
						className={`text-5xl flex justify-end font-bold duration-300 ${
							isDark ? "text-dark-content" : "text-light-content"
						}`}>
						{result}
					</h1>
					<span
						className={`opacity-30 text-md flex justify-end mt-4 -mb-4 duration-300 ${
							isDark ? "text-dark-content" : "text-light-content"
						}`}>
						{academic}
					</span>
				</div>

				<div
					className={`w-full p-10 rounded-xl flex flex-col duration-300 ${
						isDark ? "bg-dark-primary" : "bg-light-primary"
					}`}>
					<div className="flex flex-col gap-4">
						{inputList.map((input) => (
							<Input
								key={input.id}
								id={input.id}
								selectedGrades={input.grades}
								selectedUnits={input.units}
								setResult={setResult}
								setInputList={setInputList}
								showDelete={showDelete}
								isDark={isDark}
							/>
						))}
					</div>

					<button
						className={`rounded-lg py-2 px-3 mt-8 text-background text-lg duration-300 ${
							isDark
								? "bg-dark-accent-1 hover:bg-dark-accent-2 text-light-content"
								: "bg-light-accent-1 hover:bg-light-accent-2 text-dark-content"
						}`}
						onClick={handleAddClick}>
						Add
					</button>
				</div>
			</div>

			<footer
				className={`fixed bottom-4 right-4 duration-300 ${
					isDark ? "text-dark-content" : "text-light-content"
				}`}>
				<a
					href="https://www.facebook.com/gabato.aaron30"
					target="_blank">
					© Aaron Jay Gabato. Buy me a Coffee! ☕
				</a>
			</footer>
		</div>
	);
}

export default App;
