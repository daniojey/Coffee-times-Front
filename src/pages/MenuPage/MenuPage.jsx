import React, { useEffect, useReducer, useState, useRef } from "react";

import { api } from '../../../api';
import '../../common/scripts/truncate'

import './MenuPage.css'
import { Link, useSearchParams } from "react-router-dom";
import { truncateString } from "../../common/scripts/truncate";



const InitialState = {
    loading: false,
    error: null,
    data: {
      count: 0,
      next: null,
      previous: null,
      results: []
    },
    currentPage: 1,
    countPage: 0,
    pages: []
}


const ACTIONS = {
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    SET_PAGE: 'SET_PAGE',
    SETCOUNT_PAGE: 'SETCOUNT_PAGE',
    SET_PAGES: 'SET_PAGES',
}


function paginationReducer(state, action) {
    switch (action.type) {
      case ACTIONS.LOADING:
        return { ...state, loading: true, error: null };
      
      case ACTIONS.SUCCESS:
        return { 
          ...state, 
          loading: false, 
          data: action.payload,
          error: null
        };
      
      case ACTIONS.ERROR:
        return { ...state, loading: false, error: action.payload };
      
      case ACTIONS.SET_PAGE:
        return { ...state, currentPage: action.payload };

      case ACTIONS.SETCOUNT_PAGE:
        return {...state, countPage: action.payload};
    
      case ACTIONS.SET_PAGES:
        return {...state, pages: action.payload}

      default:
        return state;
    }
  }
  


function MenuPage() {
    const [state, dispatch] = useReducer(paginationReducer, InitialState);

     // Используем хук useSearchParams для управления URL-параметрами
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Извлекаем параметры из URL
    const page = searchParams.get('page') || '1';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const [searchInput, setSearchInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('') 


    const buildUrl = () => {
        let baseUrl = '/api/v1/products-menupage/';

        const params = new URLSearchParams();

        if (page) params.set('page', page); 
        if (search) params.set('search', search);
        if (category) params.set('category', category);

        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    const fetchData = async (url) => {
        dispatch({ type: ACTIONS.LOADING});

        try {
            const response = await api.get(url, {withCredentials: true});

            dispatch({ type:ACTIONS.SUCCESS , payload: response.data})


            const countPages = Math.ceil( response.data.count / response.data.items_per_page )
            const pages = Array.from({ length: countPages }, (_, i) => i + 1)
            dispatch({ type:ACTIONS.SET_PAGES, payload: pages})


            const urlObj = new URL(url, window.location.origin);
            const pageParam = urlObj.searchParams.get('page');
            if (pageParam) {
                dispatch({ type: ACTIONS.SET_PAGE, payload: parseInt(pageParam, 10)});
            } else {
                dispatch({ type:ACTIONS.SET_PAGE, payload: 1})
            }



        } catch (error) {
            console.log(error)
            dispatch({ type: ACTIONS.ERROR, payload: error });
        }
    }
    

    useEffect(() => {
        const url = buildUrl();
        fetchData(url);
    }, [page, search, category]);


    const handleNextPage = () => {
        if (state.data.next) {
          // Извлекаем номер страницы из next URL и обновляем searchParams
          const nextUrl = new URL(state.data.next, window.location.origin);
          const nextPage = nextUrl.searchParams.get('page') || '2';
          
          // Создаем новые параметры на основе текущих
          const newParams = new URLSearchParams(searchParams);
          newParams.set('page', nextPage);
          setSearchParams(newParams);
        }
      };
      

    const handlePrevPage = () => {
        if (state.data.previous) {
          // Извлекаем номер страницы из previous URL и обновляем searchParams
          const prevUrl = new URL(state.data.previous, window.location.origin);
          const prevPage = prevUrl.searchParams.get('page') || '1';
          
          // Создаем новые параметры на основе текущих
          const newParams = new URLSearchParams(searchParams);
          newParams.set('page', prevPage);
          setSearchParams(newParams);
        }
      };
      

    const handleSetPage = (pageNumber) => {
        // Создаем новые параметры на основе текущих
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', pageNumber.toString());
        setSearchParams(newParams);
      };


    const handleSubmit = (e) => {
        e.preventDefault();

        // Создаем новые параметры
        const newParams = new URLSearchParams();

        // Добавляем только непустые значения
        if (searchInput) newParams.set('search', searchInput);
        if (categoryInput) newParams.set('category', categoryInput);
        // ...

        setSearchParams(newParams);

    }



    return (
        <div className="base-menu-container">
            <div className='filter-content'>
                <form className='menu-form-content' onSubmit={handleSubmit}>
                    <div className='filter-main-body'>
                        <div className='form-section'>
                            <label htmlFor="search">Пошук по меню:</label>
                            <input  onChange={(e) => setSearchInput(e.target.value)} type="text" id="search" name="search" placeholder="Пошук по назві"/>
                        </div>
                        
                        <div className='form-section'>
                            <label htmlFor="category">Категорія:</label>
                            <select id="category" name="category" onChange={(e) => setCategoryInput(e.target.value)}>
                                <option value="">Усі</option>
                                <option value="Кава" defaultChecked>Кава</option>
                                <option value="Десерти">Десерты</option>
                                <option value="Снеки" >Закуски</option>
                                <option value="Блюда">Основні страви</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" className='menu-filter-btn'>Пошук</button>
                </form>
            </div>

            <div className='products-base-container'>
                    {!state.loading && !state.error && (
                        state.data.results.map((item, index) => (
                            <Link className='product-link' key={item.id}>
                                <div 
                                className='product'  
                                style={{ animationDelay: `${index * 0.15}s` }}
                                >
                                    <div className='product-image'>
                                        <img src={item.image_url}/>
                                    </div>

                                    <div className='product-context'>
                                        <p>{ item.name }</p>
                                        <p>{ truncateString(item.description, 70)}</p>
                                        <p>{ item.price } грн</p>
                                    </div>
                                </div>
                            </Link>
                        ))

                    )}
            </div>

            {/* <div>
                { !state.loading && !state.error && (
                    state.data.results.map((item, index) => (
                        <div key={item.id}>
                            <p>{item.id}</p>
                            <p>{item.name}</p>
                            <p>{item.description}</p>
                            <p>{item.category_name}</p>
                            <p>{item.price}</p>
                            <p>{item.discount}</p>
                            <p>{item.image_url}</p>
                        </div>
                    ))
                )}
            </div> */}

            {state.data.results.length > 0 && (
                <div className="pagination">
                    <button 
                    className="pagination-button"
                    onClick={handlePrevPage} 
                    disabled={!state.data.previous}
                    >
                    Назад
                    </button>
                    
                    {state.pages.map(num => (
                        <button 
                        key={num} 
                        value={num} 
                        onClick={(e) => handleSetPage(e.target.value)}
                        className={`pagination-button ${state.currentPage === num ? 'active': ''}`}
                        disabled={state.currentPage === num}
                        >
                        {num}</button>
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

export default MenuPage;