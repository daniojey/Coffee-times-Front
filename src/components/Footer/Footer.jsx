import React from "react";

import DynamicPngIcon from "../UI/icons/DynamicPngIcon";

import './Footer.css';

function Footer() {
    const handleClickLink = (e, nameLink) => {
        switch(nameLink) {
            case 'instagram':
                window.open('https://www.instagram.com/saymios/', '_blank');
                break;
            case 'telegram':
                window.open('https://t.me/Saymios', '_blank');
                break;
        }
    }

    return (
        <footer>
            <div className='footer-container'>
                <div className='footer-image-container'>
                    <label>Нащі соц-мережі - </label>

                    <DynamicPngIcon iconName='instagramIcon' alt='Instagram' onClick={(e) => handleClickLink(e, 'instagram')}/>
                    <DynamicPngIcon iconName='telegramIcon' alt='Telegram' onClick={(e) => handleClickLink(e, 'telegram')}/>
                    {/* <a href="https://www.instagram.com/saymios/">Instagram</a>
                    <a href="https://t.me/Saymios">Telegram</a> */}
                </div>
                <div className='footer-content-container'>
                    <p>2024 Все права защищены</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;