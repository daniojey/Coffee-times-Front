import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import { Link } from "react-router-dom";

// Фикс для иконок Leaflet в React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


import './MapPage.css'
import { api } from "../../../api";


// Компонент для управления картой (flyTo, openPopup)
function MapController({ markerRef, flyToId }) {
    const map = useMap();

    useEffect(() => {
      if (flyToId !== null && markerRef.current[flyToId]) {
        console.log('Полёт к маркеру на', flyToId)
        const marker = markerRef.current[flyToId];
        const position = marker.getLatLng();
        
        // Перемещаемся к маркеру
        map.flyTo(position, 13);
        
        // Открываем popup
        const timer = setTimeout(() => {
          marker.openPopup();
        }, 500); // Небольшая задержка для завершения анимации перемещения

        return () => clearTimeout(timer);
      }
    }, [map, flyToId, markerRef]);
    
    return null;
}



function MapPage() {
    const [coffeehouses, setCoffeehouses] = useState([]);
    const [searchCoffeehouses, setSearchCoffeehouses] = useState([]);
    const [searchInput, setSearchInput] = useState(''); 
    const [flyToId, setFlyToId] = useState(null);
    const markerRef = useRef({});

    useEffect(() => {

        const fetchCoffeehouses = async () => {
            try {
                const response = await api.get('/api/v1/coffeehouse-map-page/', {withCredentials: true});
                setCoffeehouses( response.data.results );
            } catch(err) {
                console.log(err)
            }

        }

        fetchCoffeehouses()

    }, []);



    const setMarkerRef = useCallback((marker, id) => {
        if (marker && !markerRef.current[id]) {
            // console.log('Установка маркера с ID:', id);
            markerRef.current[id] = marker;
            console.log('Создается маркер с данными', id);
        }
    }, []);


    const handleMarkerButtonClick = (id) => {
        console.log('FLY to', id);
        setFlyToId(id);
    };

    const filteredCoffeehouses = (e) => {
        e.preventDefault();

        const searchValue = searchInput;

        if (coffeehouses && searchValue) {
            const filtered = coffeehouses.filter(
                house => house.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                house.address.toLowerCase().includes(searchValue.toLowerCase())
            )
            // console.log(filtered)
            setSearchCoffeehouses(filtered)
        }

    }


    return (
        <div className="base-map-container">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossOrigin=""/>
            <div className="base-search-block">

                <div className="search-container">
                    <h3>Пошук Кав'ярні</h3>
                    <form id="map-search-form" onSubmit={filteredCoffeehouses}>
                        <input type="text" name="address-coffeehouse" id="search-coffeehouse" placeholder="Введіть адрессу кав'ярні" onChange={(e) => setSearchInput(e.target.value)}/>
                        <button data-testid="submit-btn" id="search-button" type="submit">Пошук</button>
                    </form>
                </div>


                <div className={`search-coffeehouses ${searchCoffeehouses.length > 0 ? 'active': ''}`}>
                    <h3 className="search-coffeehouses-title">Результати пошуку</h3>

                    { searchCoffeehouses && (
                        searchCoffeehouses?.map((house, index) => (
                            <div className="recomend-item" key={house.id} data-testid={`${index}-house ${house.id}`} data-id={house.id} onClick={() => handleMarkerButtonClick(house.id)}>

                                <div className="recomend-item__img">
                                    <img src={house.image_url} alt="Кав'ярня " id='coffeehouse-image'/>
                                </div>

                                <div className="recomend-item__info">
                                    <div className="recomend-item__info__address">
                                        <p>Адресса: {house.address}</p>
                                        <p></p>
                                    </div>
                                    
                                    <p>Графік роботи:  {house.opening_time} - {house.closing_time}</p>
                                    <p>Вихідні: Суббота|Неділя</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                

                <div className="recomend-coffeehouses">
                    <h3>Рекомендації для вас:</h3>

                    {coffeehouses && (
                        coffeehouses?.map(house => (
                            <div className="recomend-item" key={house.id} data-id={house.id} onClick={() => handleMarkerButtonClick(house.id)}>

                                <div className="recomend-item__img">
                                    <img src={house.image_url} alt="Кав'ярня " id='coffeehouse-image'/>
                                </div>

                                <div className="recomend-item__info">
                                    <div className="recomend-item__info__address">
                                        <p>Адресса: {house.address}</p>
                                        <p></p>
                                    </div>
                                    
                                    <p>Графік роботи:  {house.opening_time} - {house.closing_time}</p>
                                    <p>Вихідні: Суббота|Неділя</p>
                                </div>
                            </div>
                        ))
                        
                    )}
                    
                </div>
            </div>

            
            {/* <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
            <h1>Карта</h1>

             */}
            <div className="map-container">
                <MapContainer center={[50.4501, 30.5234]} zoom={13} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    { coffeehouses && (
                        coffeehouses?.map(house => (
                            <Marker 
                            position={house.location} 
                            id={house.id} 
                            key={house.id}
                            ref={(ref) => setMarkerRef(ref, house.id)}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h3>{house.name}</h3>
                                        <p>{house.address}</p>
                                        <Link className="popup-link" to={`/create-reservation/?coffeehouse=${house.id}`}>Створити бронь</Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    )}

                    <MapController markerRef={markerRef} flyToId={flyToId}>1</MapController>
                </MapContainer>
            </div>
        </div>

    )
}

export default MapPage