import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { api, fetchCSRFToken } from '../../../api';
import CreateReservationPage from './CreateReservationPage';
import { act } from 'react';


const user = { id: 0, name: 'Dima'};


const AuthContextMock = {
    user: user
}


const navigateMock = vi.fn();
// const searchParamsMock = vi.fn();


vi.mock('react-router-dom', async() => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => navigateMock,
    // useSearchParams: () => searchParamsMock,
}));


vi.mock('../../../api', () => {
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


describe('Тестирование страницы создания бронирования', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    const renderPage = (context = AuthContextMock) => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={context}>
                    <CreateReservationPage />
                </AuthContext.Provider>
            </MemoryRouter>
        )
    }

    test('Проверка наличия всез необходимых полей',async () => {
        api.get.mockResolvedValue({
            data: {
                coffeehouses: [
                    {
                        id: 0,
                        name: 'times 1'
                    }
                ]
            }
        })

        renderPage();
        
        expect(screen.getByTestId('coffeehouse')).toBeInTheDocument();
        expect(screen.getByTestId('date')).toBeInTheDocument();

        // expect(screen.getByTestId('customer_name')).not.toBeVisible();
        // expect(screen.getByTestId('customer_phone')).not.toBeVisible();
        // expect(screen.getByTestId('reservation_time')).not.toBeVisible();
        // expect(screen.getByTestId('booking_duration')).not.toBeVisible();
        // expect(screen.getByTestId('table')).not.toBeVisible();
    });

    test('Проверка всего цикла создания бронирования', async () => {
        api.get
            .mockResolvedValueOnce({ 
            data: { coffeehouses: [{ id: 1, name: 'Test Coffeehouse' }] 
            }})
            .mockResolvedValueOnce({ 
            data: { times: ['10:00', '15:00'] }
            })

        api.post
            .mockResolvedValueOnce({ 
            data: { data: ['01:00', '01:30'] }
            })
            // .mockResolvedValueOnce({ 
            // data: { data: ['01:00', '01:30'] }
            // })
            .mockResolvedValueOnce({ 
            data: { tables: [{ id: 1, name: 'Table 1' }] 
            }})
            .mockResolvedValueOnce({ 
            status: 201 
            });

        // Комм
        const user = userEvent.setup();
        renderPage();

        // Шаг 1: Выбор кофейни
        await waitFor(() => {
            expect(screen.getByTestId('coffeehouse')).toBeInTheDocument();
        });
        
        await act(async () => {
            await user.selectOptions(screen.getByTestId('coffeehouse'), '1');
        });

        // Шаг 2: Ввод даты
        await act(async () => {
            await user.type(screen.getByTestId('date'), '2025-05-05');
        });

        // Шаг 3: Проверка загрузки времени
        await waitFor(() => {
            expect(screen.getByTestId('reservation_time')).toHaveValue('10:00');
        });

        // Шаг 4: Выбор времени
        await act(async () => {
            await user.selectOptions(screen.getByTestId('reservation_time'), '10:00');
            await user.click(screen.getByText('Зберегти'));
        });

        // Шаг 5: Проверка загрузки продолжительности
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
            'api/v1/get-booking-duration/',
            expect.objectContaining({
                coffeehouse: '1',
                reservation_time: '10:00'
            }),
            expect.any(Object)
            );
            
            expect(screen.getByTestId('booking_duration')).toHaveValue('01:00');
        });

        // Шаг 6: Выбор продолжительности
        await act(async () => {
            await user.selectOptions(screen.getByTestId('booking_duration'), '01:00');
        });

        // Шаг 7: Проверка загрузки столов
        await waitFor( async() => {
            expect(screen.getByTestId('table')).toHaveValue('1');
        });

        // Финальная проверка
        await act( async () => {
            fireEvent.submit(screen.getByTestId('form-data'));
            // await user.click(screen.getByTestId('submit-btn'))
        });

            // fireEvent.click(screen.getByTestId('submit-btn'))

        await new Promise(resolve => setTimeout(resolve, 500)); // Пауза для анимации

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/');

            console.log('Все GET запросы:', api.get.mock.calls);
            console.log('Все POST запросы:', api.post.mock.calls.map(call => ({
            url: call[0],
            data: call[1]
            })));
        });

        
    });

    test('Проверка работы кнопки', async() => {
        renderPage()
        const user = userEvent.setup();

        await user.click(screen.getByTestId('submit-btn'));
    });

    test('Проверка наличия полей имени и телефона при незарегестрированном пользователе', () => {
        const noUser = null;
        const context = {
            user: noUser
        };

        renderPage(context);

        expect(screen.getByTestId('customer_name')).toBeInTheDocument();
        expect(screen.getByTestId('customer_phone')).toBeInTheDocument();
    })
})