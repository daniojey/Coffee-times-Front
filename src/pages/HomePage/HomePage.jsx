{/* Библиотеки */}
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from '../../../api.js';
import { useNavigate } from "react-router-dom";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

{/* Компоненты */}
import ProductHomePage from "../../components/ProductHomePage/ProductHomePage.jsx";
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon.jsx";

{/* Стили */}
import './HomePage.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';



function HomePage() {
    const [products, setProducts] = useState([]);
    const navigation = useNavigate();

    const handleClickLink = (e, nameLink) => {
        switch(nameLink) {
            case 'map':
                navigation('/map');
                break;
            case 'reservation':
                navigation('/reservation');
                break;
            case 'search':
                navigation('/search');
                break;

        }
    }


    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await api.get('/api/v1/products-homepage/');
                setProducts(response.data.products);
            } catch (error) {
            }
        }

        getProducts();
    }, [])


    return (
        <>
            <div className="hero-block" >
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
                    slidesPerView={3}
                    centeredSlides={true}
                    speed={1200}
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
                        0: {
                          slidesPerView: 1,
                          spaceBetween: 10,
                        },
                        1000: {
                          slidesPerView: 3,
                          spaceBetween: 20,
                        }
                    }}
                    >
                    
                    {products.map((product, index) => (
                        <SwiperSlide key={index}>
                            <ProductHomePage data={product}/>
                        </SwiperSlide>
                    ))}

                </Swiper>
            </div>

            <div className='navigation-block'>
                <p className='navigation-block-title'>Бронювання столиків легко та зручно</p>

                <div className="navigation-block__map" onClick={(e) => handleClickLink(e, 'map')}>
                    <p className='map-title'>Знайти на мапі</p>
                    <DynamicPngIcon iconName="mapIntro" className="map-intro"/>
                    <DynamicPngIcon iconName="mapIcon" className="mark-map" />
                </div>

                <div className="navigation-block__info" onClick={(e) => handleClickLink(e, 'search')}>
                    <div className="navigation__info-first" data-url="">
                        <DynamicPngIcon iconName="searchIcon" className="navigation__info-search-img"/>
                        <p>Пошук бронювання</p>
                    </div>

                    <div className="navigation__info-second" onClick={(e) => handleClickLink(e, 'reservation')}>
                        <DynamicPngIcon iconName="plusIcon" className="navigation__info-plus-img"/>
                        <p>Створити бронювання</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage;