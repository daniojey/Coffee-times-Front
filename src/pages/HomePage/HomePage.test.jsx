import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import userEvent from '@testing-library/user-event';
import { Swiper, SwiperSlide } from 'swiper/react';

import { api, fetchCSRFToken } from '../../../api';
import ProductHomePage from "../../components/ProductHomePage/ProductHomePage.jsx";
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon.jsx";
import axios from 'axios';


// Мокируем весь api.js модуль
vi.mock('../../../api', () => {
  // Создаем базовые моки для api и s3Api
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  
  // Мок для функции fetchCSRFToken
  const mockFetchCSRFToken = vi.fn().mockResolvedValue('mock-csrf-token');
  

  return {
    api: mockApi,
    fetchCSRFToken: mockFetchCSRFToken
  };
});

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));



vi.mock('swiper/react', async () => ({
    ...(await vi.importActual('swiper/react')),

    Swiper: ({ children }) => (
    <div data-testid="swiper-mock">
      {children}
    </div>
    ),

    SwiperSlide: ({ children }) => (
        <div data-testid="swiper-slide-mock">
        {children}
        </div>
    ),
}));


vi.mock('../../components/ProductHomePage/ProductHomePage.jsx', () => ({
    default: ({ data }) => <div>{ data.name }</div>
}))


vi.mock('../../components/UI/icons/DynamicPngIcon.jsx', () => ({
    default: () => <div>PNGIcon</div>
}))


describe('HomePage', () => {
    beforeEach(() => {
        window.alert = vi.fn();

        vi.clearAllMocks();
    })

    afterEach(() => {
        // Очищаем моки после теста
        vi.restoreAllMocks();
    });

    const renderComponent = () => {
        return render(<HomePage />)
    }

    test('Загружаются ли продукты при загрузке страницы', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                products: [
                    {
                        image_url: 0, 
                        name: 'Латте',
                        description: 'Опис 1',
                        price: 20.50
                    }
                ]
            }
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Латте')).toBeInTheDocument();
        })

        expect(api.get).toHaveBeenCalledWith('/api/v1/products-homepage/');
    });

    test('Проверяем наличие блоков с ссылками', async () => {
        renderComponent()

        expect(screen.getByTestId("navigation-block__map")).toBeInTheDocument();
        expect(screen.getByTestId('navigation__info-first')).toBeInTheDocument();
        expect(screen.getByTestId('navigation__info-second')).toBeInTheDocument();
    });

    test('Проверка работы ссылок', async () => {
        renderComponent()
        const user = userEvent.setup();

        const mapLink = screen.getByTestId("navigation-block__map");
        const searchLink = screen.getByTestId('navigation__info-first');
        const createLink = screen.getByTestId('navigation__info-second');


        await user.click(mapLink);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/map');
        });


        await user.click(searchLink);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/search-reservations');
        });


        await user.click(createLink);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/search-reservations');
        });
    });

    test('Передаём несколько продуктов и проверяем наличие на странице', async () => {
        api.get.mockResolvedValue({
             data: {
                products: [
                    {
                        image_url: 0, 
                        name: 'Латте',
                        description: 'Опис 1',
                        price: 20.50
                    },
                    {
                        image_url: 0, 
                        name: 'Раф',
                        description: 'Опис 2',
                        price: 10.50
                    }
                ]
            }
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Латте')).toBeInTheDocument();
            expect(screen.getByText('Раф')).toBeInTheDocument();
        })
    })
})