import React, {useState, useReducer, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../../../api";

import './ProfileHistoryPage.css'



const InitialState = {
    loading: false,
    data: {
        count: 0,
        next: null,
        previous: null,
        results: []
    },
    error: null,
    pages: [],
    currentPage: 1,
    sortBy: false,
    isActive: false,
    isCafe: false,

}


const ACTIONS = {
    LOADING: 'LOADING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    SET_PAGE: 'SETPAGE',
    SET_PAGES: 'SETPAGES',
    SET_SORT_BY: 'SETSORTBY',
    SET_IS_ACTIVE: 'SETISACTIVE',
    SET_IS_CAFE: 'SETISCAFE',
}


function paginationReducer(state, action) {
    switch (action.type) {
        case ACTIONS.LOADING:
            return {...state, loading:true, error:null};
        
        case ACTIONS.ERROR:
            return {...state, error:action.payload};

        case ACTIONS.SUCCESS:
            return {...state, data: action.payload, error: null};
        
        case ACTIONS.SET_PAGE:
            return {...state, currentPage: action.payload};
        
        case ACTIONS.SET_PAGES:
            return {...state, pages: action.payload};

        case ACTIONS.SET_SORT_BY:
            return {...state, sortBy: action.payload};
        
        case ACTIONS.SET_IS_ACTIVE:
            return {...state, isActive: action.payload};

        case ACTIONS.SET_IS_CAFE:
            return {...state, isCafe: action.payload};
    }
}

// Добавьте эту функцию для расчета отображаемых страниц
const getVisiblePages = (currentPage, totalPages) => {
    // Показываем 1 страницу назад и 2 страницы вперед от текущей
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Создаем массив видимых страниц
    const visiblePages = [];
    
    // Добавляем первую страницу и многоточие, если нужно
    if (startPage > 1) {
      visiblePages.push(1);
      if (startPage > 2) {
        visiblePages.push('...');
      }
    }
    
    // Добавляем основные страницы (1 назад, текущая, 2 вперед)
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    // Добавляем многоточие и последнюю страницу, если нужно
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        visiblePages.push('...');
      }
      visiblePages.push(totalPages);
    }
    
    return visiblePages;
  };



function ProfileHistoryPage() {
    const [state, dispatch] = useReducer(paginationReducer, InitialState)

    const [searchParams, setSearchParams] = useSearchParams()

    const page = searchParams.get('page') || '1';
    const sort_by = searchParams.get('sort_by') || '';
    const is_active = searchParams.get('is_active') || '';
    const is_cafe = searchParams.get('is_cafe') || '';


    const buildUrl = () => {
        const baseUrl = '/api/v1/user_history_reservations/'

        const params = new URLSearchParams()

        if (page) params.set('page', page);
        if (sort_by) params.set('sort_by', sort_by);
        if (is_active) params.set('is_active', is_active);
        if (is_cafe) params.set('is_cafe', is_cafe);
        

        const queryString = params.toString();
        console.log(queryString)
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }


    const fetchData = async (url) => {
        dispatch({ type: ACTIONS.LOADING })

        try {
            const response = await api.get(url, { withCredentials: true });
            console.log(response.data)

            dispatch({ type: ACTIONS.SUCCESS , payload: response.data});

            const countPages = Math.ceil( response.data.count / response.data.items_per_page )
            const pages = Array.from({ length: countPages }, (_, i) => i + 1)
            dispatch({ type:ACTIONS.SET_PAGES, payload: pages })

            const urlObj = new URL(url, window.location.origin);
            const pageParam = urlObj.searchParams.get('page');

            if (pageParam) {
                dispatch({ type: ACTIONS.SET_PAGE, payload: parseInt(pageParam,  10)});
            } else {
                dispatch({ type: ACTIONS.SET_PAGE, payload: 1})
            }
        } catch (err) {
            dispatch({ type: ACTIONS.ERROR, payload: err});
        } finally {
            dispatch({ type: ACTIONS.LOADING });
        }

    }


    useEffect(() => {
        const url = buildUrl()
        fetchData(url);
    }, [page, sort_by, is_active, is_cafe])


    const handleNextPage = (e) => {
        if (state.data.next) {
            const url = new URL(state.data.next, window.location.origin);
            const nextPage = url.searchParams.get('page') || 2;

            const params = new URLSearchParams(searchParams);
            params.set('page', nextPage);

            setSearchParams(params);
        }
    }


    const handlePrevPage = (e) => {
        if (state.data.previous) {
            const url = new URL(state.data.previous, window.location.origin);
            const prevPage = url.searchParams.get('page') || 1;

            const params = new URLSearchParams(searchParams);
            params.set('page', prevPage);

            setSearchParams(params);
        }
    }


    const handleSetPage = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber)

        setSearchParams(params)
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();

        if(state.sortBy) params.set('sort_by', state.sortBy);
        if(state.isActive) params.set('is_active', state.isActive);
        if(state.isCafe) params.set('is_cafe', state.isCafe);


        setSearchParams(params)
    }


    return(
        <div className='base-history-container'>
            <div className="history-content">
                <div className='reservation-content'>
                    <form method="get" className='filter-form-content' onSubmit={handleSubmit}>
                        <h2>Фільтри</h2>
                        
                        <label htmlFor="is_active">
                            <input 
                            type="checkbox" 
                            name="is_active" 
                            value="true" 
                            onChange={(e) => dispatch({ type: ACTIONS.SET_IS_ACTIVE, payload: e.target.checked})} />
                            Актуальні
                        </label>
                        
                        <label htmlFor="is_cafe">
                            <input 
                            type="checkbox" 
                            name="is_cafe" 
                            value="true"
                            onChange={(e) => dispatch({ type: ACTIONS.SET_IS_CAFE, payload: e.target.checked})}/>
                            Кав'ярні
                        </label>
                        
                        <label htmlFor="sort_by">Сортувати по:</label>
                        <select name="sort_by" onChange={(e) => dispatch({ type: ACTIONS.SET_SORT_BY, payload: e.target.value })}>
                            <option value="default" >по замовчуванню</option>
                            <option value="date" >Дата</option>
                            <option value="time" >Час</option>
                        </select>
                        
                        <button type="submit" className='filter-history-button'>Застосувати</button>
                    </form>
                </div>

                <div className='filter-history-content'>
                    {state.data.results.length > 0 && (
                        state.data.results.map(reservation => (
                            <div className='reservation-item-history' key={reservation.id}>
                                <p>Кав'ярня - {reservation.coffeehouse_name}</p>
                                <p>Дата - {reservation.reservation_date}</p>
                                <p>Час резервації - {reservation.reservation_time}</p>
                            </div>
                        ))
                    )}
                    
                </div>

            </div>

            {state.data.results.length > 0 && (
            <div className="pagination">
                <button 
                className="pagination-button"
                onClick={handlePrevPage} 
                disabled={!state.data.previous}
                >
                Назад
                </button>
                
                {getVisiblePages(state.currentPage, state.pages.length).map((item, index) => (
                item === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                    <button 
                    key={item} 
                    value={item} 
                    onClick={(e) => handleSetPage(e.target.value)}
                    className={`pagination-button ${state.currentPage === item ? 'active': ''}`}
                    disabled={state.currentPage === item}
                    >
                    {item}
                    </button>
                )
                ))}
                
                <button 
                onClick={handleNextPage} 
                disabled={!state.data.next}
                className="pagination-button"
                >
                Вперед
                </button>
            </div>
        )}
        </div>
    )
}

export default ProfileHistoryPage