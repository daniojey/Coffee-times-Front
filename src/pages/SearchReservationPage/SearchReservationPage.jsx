import React, { useEffect, useState, useRef } from "react";

import { api } from "../../../api";

import "./SearchReservationPage.css"

function SearchReservationPage() {
    const [reservations, setReservations] = useState([]);
    const [noReservations, setNoReservatios] = useState(false);
    const [actual, setActual] = useState(false);
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);

    const sourceRef = useRef(null);
    const targetRef = useRef(null);

    const getCSRFToken = () => {
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
        return csrfCookie ? csrfCookie.split('=')[1] : '';
    }

    const fetchReservations =  async (actual, phone) => {
        try {
            const response = await api.post("api/v1/reservations_search/",
                {actual, phone},
                {
                    withCredentials:true,
                    headers: {
                        'X-CSRFToken': getCSRFToken(), // Функция для получения токена
                    }
                }
                )
            
            if (response.data.reservations.length > 0) {
                setNoReservatios(false)
                targetRef.current.style.padding = "20px";
                targetRef.current.style.border = '0.1px solid rgb(255, 255, 255, 0.05)';
                targetRef.current.style.borderTop = 'none';

                setReservations(response.data.reservations);
            } else {

                setReservations([]);
                targetRef.current.style.padding = "";
                targetRef.current.style.border = '';
                targetRef.current.style.borderTop = '';
                setNoReservatios(true);
            }
        } catch (err) {

        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchReservations(actual, phone)
        
    }

    const syncWidth = () => {
        if (sourceRef.current && targetRef.current) {
          const sourceWidth = sourceRef.current.offsetWidth;
          targetRef.current.style.width = `${sourceWidth}px`;
        }
      };
    
    useEffect(() => {
        // Инициализация ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
          syncWidth();
        });
    
        if (sourceRef.current) {
          resizeObserver.observe(sourceRef.current);
        }
    
        // Первоначальная синхронизация
        syncWidth();
    
        // Очистка при размонтировании
        return () => {
          resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="base-search-container">

            <div className="search-base-container" ref={sourceRef}>

                <div className="search-block">
                    <div className="checkbox-block">
                        <div className="checkbox-label">
                            <label>Актуальные</label>
                            <input className="actual-reservation-checkbox" type="checkbox" id="checkbox" onChange={(e) => setActual(!actual)}/>
                        </div>

                    </div>

                    <form id="phone-search-form" onSubmit={handleSubmit}>
                        <input type="text" id="phone" placeholder="Enter number.." className="search-input" onChange={(e) => setPhone(e.target.value)}/>
                        <button id="search-button" className="search-button" type="submit">Search</button>
                    </form>
                </div>
                    

                
            </div>

            <div className="reservation-block" id="reservation-block" ref={targetRef}>
                    {reservations && (
                        reservations.map((reservation, index) => (

                            <div 
                            className="reservation-item" 
                            key={reservation.id}
                            style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <p>Дата: {reservation.reservation_date}</p>
                                <p>Номер столика: {reservation.table_number}</p>
                                <p>Кількість місць: {reservation.seats}</p>
                                <p>статус: {reservation.streaming_status}</p>
                            </div>
                        ))
                    )}
            </div>

            {noReservations && (
                <div className="no-reservation-block">
                    <h2>Відсутні бронювання по данному номеру</h2>
                </div>
            )}
            
        </div>
    )
}

export default SearchReservationPage