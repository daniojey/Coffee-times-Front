import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
    return (
        <header>
            <div className="base-links-container">
                <div className='home-page-container'>
                    <Link to='/'>Головна</Link>
                </div>

                <div className='base-links' id='base-links'>
                    <ul className='header-links'>
                        <li><Link to='/menu'>Меню</Link></li>
                        <li><Link to='/map'>Мапа кав'ярень</Link></li>
                        <li><Link to='/search-reservations'>Мої бронювання</Link></li>
                        <li><Link to='/profile'>Профіль</Link></li>
                        <li><Link to='/login'>Увійти</Link></li>
                        <li><Link to='/registration'>Зарееструватися</Link></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default Header;