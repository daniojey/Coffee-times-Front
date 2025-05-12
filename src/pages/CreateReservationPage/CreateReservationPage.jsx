import React, { useState, useReducer, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "../../AuthContext";
import { api, fetchCSRFToken } from "../../../api";

import './CreateReservationPage.css'


const InitialState = {
    coffeehouses: [

    ],

    times: [

    ],

    duration: [

    ],

    tables: [

    ],
}


const ACTIONS = {
    SET_COFFEEHOUSES: 'SETCOFFEEHOUSES',
    SET_TIMES: 'SETTIMES',
    SET_DURATION: 'SETDURATION',
    SET_TABLES: 'SETTABLES',
}


function reducerFunc( state, action ) {
    switch (action.type) {

        case ACTIONS.SET_COFFEEHOUSES:
            return {...state, coffeehouses: action.payload};

        case ACTIONS.SET_TIMES:
            return {...state, times: action.payload};

        case ACTIONS.SET_DURATION:
            return {...state, duration: action.payload};

        case ACTIONS.SET_TABLES:
            return {...state, tables: action.payload};

    }
}


function CreateReservationPage() {
    const [state, dispatch] = useReducer(reducerFunc, InitialState);

    const { user } = useContext(AuthContext)
    const [searchParams] = useSearchParams()

    const [initialCoffeehouse, setInitialCoffeehouse] = useState('0');

    const [nameInput, setNameInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [coffeehouseInput, setCoffehouseInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [durationInput, setDurationInput] = useState('');
    const [tableInput, setTableInput] = useState(''); 

    const navigation = useNavigate()


    const getCSRFTokenFromCookie = () => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        console.log(cookieValue)

        return cookieValue ? decodeURIComponent(cookieValue) : '';
    };


    useEffect(() => {
        const fetchCoffeehouses = async () => {
            try {
                const response =  await api.get('/api/v1/get-coffeehouses/', {withCredentials:true});
                console.log(response.data)
                dispatch({ type:ACTIONS.SET_COFFEEHOUSES, payload: response.data.coffeehouses})
            } catch (err) {
                console.log(err)
            }
        }

        const coffeehouse = searchParams.get('coffeehouse');
        console.log('Кофейня', coffeehouse);
        setInitialCoffeehouse(coffeehouse)
        setCoffehouseInput(coffeehouse)

        fetchCoffeehouses()
    },[])


    useEffect(() => {


        if (coffeehouseInput && dateInput) {
            const fetchTimes = async () => {
                try {
                    const response = await api.get(`/orders/reservation/get-available-times/?date=${dateInput}&coffeehouse=${coffeehouseInput}`)
                    console.log(response.data.times)
                    dispatch({ type: ACTIONS.SET_TIMES, payload: response.data.times})
                } catch (err) {
                    console.log('Ошибка при обработке', err)
                }
            }

            fetchTimes()
        } else {
            console.log('Ошибка при обработке')
        }


        if (coffeehouseInput && dateInput && timeInput) {
            const fetchDuration = async () => {
                try {
                    await fetchCSRFToken()

                    const response = await api.post('api/v1/get-booking-duration/', 
                        {coffeehouse: coffeehouseInput, reservation_time: timeInput}, 
                        {
                            withCredentials: true,
                            headers: {
                                'X-CSRFToken': getCSRFTokenFromCookie(), // Функция для получения токена
                            }
                                
                        }
                    )

                    console.log(response.data.data)
                    dispatch({ type: ACTIONS.SET_DURATION, payload: response.data.data})
                } catch (err) {
                    console.log('Ошибка обработки',err)
                }
            }

            fetchDuration()
        } else {
            console.log('Ошибка при обработке')
        }


        if (coffeehouseInput && dateInput && timeInput && durationInput && durationInput !== '00:00' ) {

            
            console.log(durationInput)
            const fetchTables = async () => {
                try {
                    await fetchCSRFToken()

                    const response = await api.post('api/v1/get-tables/', {
                        coffeehouse: coffeehouseInput,
                        reservation_date: dateInput,
                        reservation_time: timeInput,
                        booking_duration: durationInput
                    },
                    {
                    withCredentials: true,
                    headers: {
                            'X-CSRFToken': getCSRFTokenFromCookie(), // Функция для получения токена
                    }
                    }
                    )

                    console.log(response.data.tables)
                    dispatch({ type: ACTIONS.SET_TABLES, payload: response.data.tables})

                    if (response.data.tables.length > 0) {
                        setTableInput(response.data.tables?.[0]?.id)
                    }
                } catch (err) {
                    console.log('Ошибка обработки', err)
                }
            }

            fetchTables()
        } else {
            console.log(`Данных недостаточно ${coffeehouseInput}-${dateInput}-${timeInput}-${durationInput}`)
        }

    }, [coffeehouseInput, dateInput, timeInput, durationInput])



    const handleSumbmit =  async (e) => {
        e.preventDefault();

        if (coffeehouseInput && dateInput && timeInput && durationInput && tableInput) {
             const createReservation = await api.post(
            "api/v1/create_reservation/",
            {
                customer_name: user ? '1' : nameInput,
                customer_phone: user ? '1' : phoneInput,
                coffeehouse: coffeehouseInput,
                table: tableInput,
                reservation_date: dateInput,
                reservation_time: timeInput,
                booking_duration: durationInput,
            },
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': getCSRFTokenFromCookie(),
                }
            }
            )
            console.log(createReservation)

            if (createReservation.status == 201) {
                navigation('/')
            }
        } else {
            console.log('Не хватает данный', coffeehouseInput, dateInput, timeInput, durationInput, tableInput)
        }
       
        console.log('Отправка формы, по идее..')
    }



    return (
        <div className="create-reservation-container">
            <div className="form-content" >
                <h2 className="form-title">Створення бронювання</h2>

                <form id="reservation-form" className="form-create-body" onSubmit={handleSumbmit}>
                    {!user && (
                        <>
                        <div className="form-field">
                            <label>І'мя</label> 
                            <input 
                            type="text" 
                            name="customer_name"
                            placeholder="Введіть ім'я" 
                            id="customer_phone" 
                            className="custom-input" 
                            onChange={(e) => setNameInput(e.target.value)}
                            maxLength="255" /
                            >
                        </div>

                        <div className="form-field">
                            <label>Номер телефону</label> 
                            <input 
                            type="text" 
                            name="customer_phone" 
                            placeholder="380xxxxxxxxx" 
                            id="customer_phone" 
                            className="custom-input"
                            onChange={(e) => setPhoneInput(e.target.value)} 
                            maxLength="15" /
                            >
                        </div>
                        </>

                    )}


                    <div className="form-field">
                        <label>Кав'ярня</label> 
                        <select 
                        name="coffeehouse" 
                        id="coffeehouse" 
                        className="custom-select" 
                        value={initialCoffeehouse ? initialCoffeehouse : ''}
                        onChange={(e) => {setCoffehouseInput(e.target.value) ,setInitialCoffeehouse(e.target.value)}}
                        required="">
                            <option value="" >---------</option>
                            {state.coffeehouses && (
                                state.coffeehouses.map(item => (
                                    <option value={item.id} key={item.id}>{item.name}</option>
                                ))
                            )}
                        </select>
                    </div>


                    <div className="form-field">
                        <label>Дата</label>  
                        <input 
                        type="date" 
                        name="reservation_date" 
                        id="reservation_date" 
                        className="date-reservation-input" 
                        placeholder="Оберіть дату" 
                        onChange={(e) => setDateInput(e.target.value)}
                        min="2025-05-09" 
                        required=""/>
                    </div>
                    

                    { state.times.length > 0 && (
                        <div className="form-field">
                        <label>Час бронювання</label> 
                        <select 
                        name="reservation_time" 
                        id="reservation_time" 
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="time-input">
                            { state.times ? (
                                state.times.map(time => (
                                    <option value={time} key={time}>{time}</option>
                                ))
                            ) : (
                                <>
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                </>
                            )}
                            
                        </select>           
                    </div>
                    )}
                    

                    { state.duration.length > 0 && (
                        <div className="form-field">
                        <label>Продовжуваність</label> 
                        <select 
                        name="booking_duration" 
                        id="booking_duration"
                        onChange={(e) => setDurationInput(e.target.value)} 
                        className="time-input">
                            { state.duration.map(time => (
                                <option value={time} key={time}>{time}</option>
                            ))}
                        </select>
                        </div>
                    )}


                    { state.tables.length > 0 && durationInput !== '00:00' && (
                       <div id="available-tables-container" className="flex-style-tables">
                            <label htmlFor="available_tables">Оберіть столик</label>
                            <select 
                            name="table" 
                            id="available_tables" 
                            className="custom-table" 
                            onChange={(e) => setTableInput(e.target.value)}
                            required="">
                                { state.tables.map(table => (
                                    <option value={table.id} key={table.id}>{table.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    

                    <div className='button-reservation-container'>
                        <button type='submit' className='submit-reservation-btn'>Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateReservationPage