import { NavLink } from 'react-router-dom';

const Navbar = () => {
	return (
		<header>
			<nav>
				<ul>
					<li><NavLink to='/'>Home</NavLink></li>
				</ul>
			</nav>
		</header>
	);
};

export { Navbar };
