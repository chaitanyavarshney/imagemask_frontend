import React from 'react';

const Button = ({
	color, onClick, children, style, ...props
}) => {
	const defaultStyle = {
		marginTop: '10px',
		padding: '10px 20px',
		border: 'none',
		borderRadius: '4px',
		cursor: 'pointer',

		...style,
	};

	const buttonStyles = {
		backgroundColor: color || '#007BFF',
		color: 'white',
	};

	return (
		<button
			onClick={onClick}
			style={{ ...defaultStyle, ...buttonStyles }}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
