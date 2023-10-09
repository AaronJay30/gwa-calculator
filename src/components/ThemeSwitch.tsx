import React from "react";
import "../css/ThemeSwitch.css";

interface Props {
	setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
	isDark: boolean;
}

const ThemeSwitch: React.FC<Props> = ({ setIsDark, isDark }) => {
	const handleCheck = () => {
		setIsDark(!isDark);
	};

	return (
		<div className="flex flex-row items-center gap-4">
			<span
				className={`font-normal uppercase text-xs duration-300 ${
					isDark ? "text-dark-content" : "text-light-content"
				}`}>
				Theme
			</span>

			<label className="switch">
				<input type="checkbox" onClick={handleCheck} />
				<span className="slider"></span>
			</label>
		</div>
	);
};

export default ThemeSwitch;
