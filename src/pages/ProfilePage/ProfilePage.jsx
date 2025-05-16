import React, { useContext, useState, useEffect } from "react";

import { AuthContext } from "../../AuthContext";
import { api } from "../../../api";

import './ProfilePage.css'
import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const { user, logout } = useContext(AuthContext)
    const [reservations, setReservations] = useState([]);
    const [actualReservation, setActualReservation] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await api.get('/api/v1/user_profile/', {withCredentials:true})

                setReservations(response.data?.reservations)
                setActualReservation(response.data?.actual_reservations)
            } catch(err) {
                console.error(err)
            }
        }
        
        fetchReservations()
    },[])

    const handleHistoryButton = (e) => {
        navigate('/reservation-history')
    }

    return (
        <div className="base-profile-container">
            <div className="profile-block__left-side">
                <div className="profile-info-block">
                    <h2 className="profile-titles">Профіль</h2> 
                    {user && <button data-testid="logout-btn" onClick={logout} className="profile-logout-btn">Выйти</button>}
                </div>

                <div className="actual-reservations-block">
                    <h2 className="profile-titles">Актуальні бронювання</h2>
                    { actualReservation && (
                            actualReservation.map((reservations, index) => (
                                <div className="reservation-profile-item actual" key={reservations.id}>
                                    <p>Кав'ярня - { reservations.coffeehouse_name }</p>
                                    <p>Дата - { reservations.reservation_date }</p>
                                    <p>Час резервації - { reservations.reservation_time }</p>
                                    <p>Статус - { reservations.status_res }</p>
                                </div>
                            ))
                        )}
                </div>
            </div>

            <div className="profile-block__right-side">
                <div className="user-reservations-block">
                    <h2 className="profile-titles">Бронювання</h2>
                    { reservations && (
                        reservations.map((reservations, index) => (
                            <div className="reservation-profile-item" key={reservations.id}>
                                <p>Кав'ярня - { reservations.coffeehouse_name }</p>
                                <p>Дата - { reservations.reservation_date }</p>
                                <p>Час резервації - { reservations.reservation_time }</p>
                                <p>Статус - { reservations.status_res }</p>
                            </div>
                        ))
                    )}

                    <button className="reservation-history-btn" data-testid="reservation-history-btn" onClick={handleHistoryButton}>Історія бронювань</button>
                </div>
            </div>

        </div>
    )
}

export default ProfilePage