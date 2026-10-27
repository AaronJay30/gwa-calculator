import React from "react";
import "../App.css";
import { GWA } from "../model";
import { FaRegTrashAlt } from "react-icons/fa";
import { VALID_GRADES } from "../gwaCalculator.mjs";

interface Props {
	course: GWA;
	onChange: (id: number, field: "grades" | "units", value: number) => void;
	onDelete: (id: number) => void;
	showDelete: boolean;
	isDark: boolean;
}

const Input: React.FC<Props> = ({
	course,
	onChange,
	onDelete,
	showDelete,
	isDark,
}) => {
	const handleGradesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange(course.id, "grades", Number(e.target.value));
	};

	const handleUnitsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange(course.id, "units", Number(e.target.value));
	};

	return (
		<div className="flex flex-row gap-4 w-full">
			<select
				name="grades"
				aria-label={`Grade for course ${course.id + 1}`}
				className={`w-full py-3 px-4 rounded-lg duration-300 ${
					isDark
						? "bg-dark-background text-dark-content"
						: "bg-light-background text-light-content"
				}`}
				value={course.grades === 0 ? "0" : course.grades.toFixed(2)}
				onChange={handleGradesChange}>
				<option value="0" disabled>
					Select your grade
				</option>
				{VALID_GRADES.map((grade) => (
					<option key={grade} value={grade.toFixed(2)}>
						{grade.toFixed(2)}
					</option>
				))}
			</select>
			<select
				name="units"
				aria-label={`Units for course ${course.id + 1}`}
				className={`py-3 px-4 sm:w-1/3 w-2/3 rounded-lg duration-300 ${
					isDark
						? "bg-dark-background text-dark-content"
						: "bg-light-background text-light-content"
				}`}
				value={course.units}
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
					aria-label={`Delete course ${course.id + 1}`}
					onClick={() => onDelete(course.id)}>
					<FaRegTrashAlt />
				</button>
			)}
		</div>
	);
};

export default Input;
