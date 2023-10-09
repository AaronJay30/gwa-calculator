import React, { useState, useEffect } from "react";
import "../App.css";
import { GWA } from "../model";
import { FaRegTrashAlt } from "react-icons/fa";

interface Props {
	selectedGrades: number;
	id: number;
	selectedUnits: number;
	setResult: React.Dispatch<React.SetStateAction<number>>;
	setInputList: React.Dispatch<React.SetStateAction<GWA[]>>;
	showDelete: boolean;
	isDark: boolean;
}

const Input: React.FC<Props> = ({
	selectedGrades,
	id,
	selectedUnits,
	setResult,
	setInputList,
	showDelete,
	isDark,
}) => {
	const [grades, setGrades] = useState(0);
	const [units, setUnits] = useState(0);

	const calculateProduct = () => {
		setInputList((prevInputList) =>
			prevInputList.map((item) =>
				item.id === id ? { ...item, grades, units } : item
			)
		);
	};

	// Update the result when grades or units change
	useEffect(() => {
		calculateProduct();
	}, [grades, units, setResult]);

	const handleGradesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setGrades(parseFloat(e.target.value));
	};

	const handleUnitsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setUnits(parseInt(e.target.value));
	};

	const handleDelete = () => {
		setInputList((prevInputList) =>
			prevInputList.filter((item) => item.id !== id)
		);
	};
	return (
		<div className="flex flex-row gap-4 w-full">
			<select
				name="grades"
				className={`w-full py-3 px-4 rounded-lg duration-300 ${
					isDark
						? "bg-dark-background text-dark-content"
						: "bg-light-background text-light-content"
				}`}
				defaultValue={selectedGrades.toString()}
				onChange={handleGradesChange}>
				<option value="0" disabled>
					Select your grade
				</option>
				<option value="1.00">1.00</option>
				<option value="1.25">1.25</option>
				<option value="1.50">1.50</option>
				<option value="1.75">1.75</option>
				<option value="2.00">2.00</option>
				<option value="2.25">2.25</option>
				<option value="2.50">2.50</option>
				<option value="2.75">2.75</option>
				<option value="3.00">3.00</option>
				<option value="4.00">4.00</option>
				<option value="5.00">5.00</option>
			</select>
			<select
				name="units"
				className={`py-3 px-4 sm:w-1/3 w-2/3 rounded-lg duration-300 ${
					isDark
						? "bg-dark-background text-dark-content"
						: "bg-light-background text-light-content"
				}`}
				defaultValue={selectedUnits}
				onChange={handleUnitsChange}>
				<option value="0" disabled>
					Units
				</option>
				<option value="1">1</option>
				<option value="2">2</option>
				<option value="3">3</option>
				<option value="4">4</option>
				<option value="5">5</option>
				<option value="6">6</option>
				<option value="7">7</option>
				<option value="8">8</option>
				<option value="9">9</option>
				<option value="10">10</option>
			</select>

			{showDelete && (
				<button
					type="button"
					className={`bg-danger-1 hover:bg-danger-2 duration-300 rounded-lg px-4 py-3 text-dark-content`}
					onClick={handleDelete}>
					<FaRegTrashAlt />
				</button>
			)}
		</div>
	);
};

export default Input;
