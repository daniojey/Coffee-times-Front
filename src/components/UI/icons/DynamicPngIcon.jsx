import React from 'react';

import mapIcon from '../../../assets/mark_map.png';
import mapIntro from '../../../assets/map_intro.png';
import searchIcon from '../../../assets/search_reservations.png';
import plusIcon from '../../../assets/plus_reservation.png';
import instagramIcon from '../../../assets/instagram.png';
import telegramIcon from '../../../assets/telegram.webp';


const iconMap = {
    mapIcon: mapIcon,
    mapIntro: mapIntro,
    searchIcon: searchIcon,
    plusIcon: plusIcon,
    instagramIcon: instagramIcon,
    telegramIcon: telegramIcon,
}


const DynamicPngIcon = ({
  iconName, // Имя файла иконки (без расширения)
  alt = 'icon',
  height = 24,
  width = 24,
  className = '',
  ...restProps
}) => {
  // Импорт иконки из assets
  const iconSrc = iconMap[iconName];

  if (!iconSrc) {
    console.error(`Иконка "${iconName}" не найдена!`);
    return null;
  }

  return (
    <img
      src={iconSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className}`}
      {...restProps}
    />
  );
};

export default DynamicPngIcon;