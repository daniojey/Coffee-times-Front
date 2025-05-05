import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";

import { useWindowResize } from "../../common/customHooks/WindowResize";

import "./Header.css";

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { width } = useWindowResize();
    const location = useLocation();


    useEffect(() => {setIsOpen(false);}, [location.pathname]);


    useEffect(() => {
        if (width > 875 && isOpen) {
            setIsOpen(false);
        }
    }, [width ,isOpen])

    
    return (
        <header>
            <div className="base-links-container">
                <div className='home-page-container'>
                    <Link to='/'>Головна</Link>
                </div>

                <div className="burger" id="burger" onClick={(e) => setIsOpen(!isOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
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

                <ul className={`mobile-links ${isOpen ? 'active': ''}`} id="mobile-links" >
                    <li><Link to='/menu'>Меню</Link></li>
                    <li><Link to='/map'>Мапа кав'ярень</Link></li>
                    <li><Link to='/search-reservations'>Мої бронювання</Link></li>
                    <li><Link to='/profile'>Профіль</Link></li>
                    <li><Link to='/login'>Увійти</Link></li>
                    <li><Link to='/registration'>Зарееструватися</Link></li>
                </ul>
            </div>
        </header>
    )
}

export default Header;