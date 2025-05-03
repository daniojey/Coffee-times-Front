import React, { use, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, s3Api } from '../../../api.js';

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import './HomePage.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

function HomePage() {
    const [heroImage, setHeroImage] = useState(null);

    useEffect(() => {
        const getHeroImage = async () => {
            try {

                const imageUrl = `${import.meta.env.VITE_REACT_S3_BUCKET_URL}/coffee_homepage2.jpg`;
                console.log(imageUrl);
                
                // Проверяем доступность через HEAD-запрос
                await s3Api.head('/coffee_homepage2.jpg');
                
                setHeroImage(imageUrl);
            } catch (error) {
                console.error("Ошибка при получении изображения:", error);
            }
        }

        getHeroImage();
    }, [])

    return (
        <>
            <div className="hero-block" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
                <div className='hero-block__info'>
                    <h2>Аромат, который объединяет</h2>  
                    <p>У нас каждое утро начинается с обжарки свежих зерен и теплых улыбок. Попробуйте авторские рецепты кофе, созданные бариста-виртуозами, и десерты ручной работы. Погрузитесь в атмосферу живых разговоров и уюта, где время замедляет свой бег.</p>
                    <Link to="/menu" className="btn-menu">Меню</Link>
                </div>
            </div>

            <div className='swiper-block'>
                <p className='swiper_block__preview'>Різноманітні аромати</p>

                <Swiper
                    modules={[Navigation, Scrollbar, A11y]}
                    slidesPerView={2}
                    navigation
                    scrollbar={{ draggable: true }}
                    onSwiper={(swiper) => console.log(swiper)}
                    onSlideChange={() => console.log('slide change')}
                    style={{ 
                        padding: '0 15px', // Добавляем отступы вместо margin
                        boxSizing: 'border-box' // Важно для правильного расчета ширины
                      }}
                      breakpoints={{
                        // Адаптивные настройки
                        320: {
                          slidesPerView: 1
                        },
                        768: {
                          slidesPerView: 2
                        }
                      }}
                    >
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>
                    <SwiperSlide><div className="block-swiper-item">Привет1</div></SwiperSlide>

                </Swiper>
            </div>
        </>
    )
}

export default HomePage;