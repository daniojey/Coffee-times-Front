import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams} from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { api, fetchCSRFToken } from '../../../api';
import { act } from 'react';
import ProfileHistoryPage from './ProfileHistoryPage';


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


describe('Тестирование странички ProfileHistoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    const baseData = {
        count: 10,
        next: '/api/v1/user_history_reservations/?page=2',
        previous: null,
        items_per_page: 4,
        results: [
            {
                id: 1,
                coffeehouse_name: 'Times 1',
                reservation_date: '2025-05-19',
                reservation_time: '15:00:00',
            },
            {
                id: 2,
                coffeehouse_name: 'Times 2',
                reservation_date: '2025-05-19',
                reservation_time: '15:00:00',
            },
            {
                id: 3,
                coffeehouse_name: 'Times 3',
                reservation_date: '2025-05-19',
                reservation_time: '15:00:00',
            },
            {
                id: 4,
                coffeehouse_name: 'Times 4',
                reservation_date: '2025-05-19',
                reservation_time: '15:00:00',
            },
        ]
    };

    const initParametrs = ['?page=1'];

    const renderPage = (parameters = initParametrs) => {
        const history = createMemoryHistory({ initialEntries: parameters });
        return {
            ...render(
            <HistoryRouter history={history}>
                <ProfileHistoryPage />
            </HistoryRouter>
            ),
            history
        };
    };

    test('Проверяем отображаются ли бронирования', async() => {
        api.get.mockResolvedValueOnce({
            data: baseData,
        });

        const { history } = renderPage();

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 1")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 2")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 3")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 4")).toBeInTheDocument();
            expect(history.location.search).toContain('?page=1');
        });
    });

    test('Проверяем работу пагинации',async () => {
        api.get
            .mockResolvedValueOnce({
                data: baseData,
            })

            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: '/api/v1/user_history_reservations/?page=3',
                    previous: '/api/v1/user_history_reservations/?page=1',
                    results: [
                        {
                            id: 5,
                            coffeehouse_name: 'Times 5',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 6,
                            coffeehouse_name: 'Times 6',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 7,
                            coffeehouse_name: 'Times 7',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 8,
                            coffeehouse_name: 'Times 8',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                    ]
                }
            })

            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: null,
                    previous: '/api/v1/user_history_reservations/?page=2',
                    results: [
                        {
                            id: 9,
                            coffeehouse_name: 'Times 9',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },

                        {
                            id: 10,
                            coffeehouse_name: 'Times 10',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                    ]
                }
            })

            .mockResolvedValueOnce({
                data: baseData,
            });


        const { history } = renderPage();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 1")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 2")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 3")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 4")).toBeInTheDocument();
            expect(history.location.search).toContain('?page=1');
        });

        await user.click(screen.getByText('Вперед'));

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 5")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 6")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 7")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 8")).toBeInTheDocument();
            expect(history.location.search).toContain('?page=2');
        });

        await user.click(screen.getByText('3'));

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 9")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 10")).toBeInTheDocument();
            expect(history.location.search).toContain('?page=3');
        });

        await user.click(screen.getByText('1'));

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 1")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 2")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 3")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 4")).toBeInTheDocument();
            expect(history.location.search).toContain('?page=1');
        });
    });

    test('Проверяем наличие полей формы фильтрации', async() => {
        api.get.mockResolvedValueOnce({
            data: baseData
        });

        const { history } = renderPage();
        
        await waitFor(() => {
            expect(screen.getByTestId('is_active')).toBeInTheDocument();
            expect(screen.getByTestId('is_cafe')).toBeInTheDocument();
            expect(screen.getByTestId('sortby')).toBeInTheDocument();
            expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
        });
    });

    test('Проверяем что при заполнении поля изменяют значение', async () => {
        api.get.mockResolvedValueOnce({
            data: baseData
        });

        const { history } = renderPage();
        const user = userEvent.setup();

        const isActive = screen.getByTestId('is_active');
        const isCafe = screen.getByTestId('is_cafe');
        const sortBy = screen.getByTestId('sortby');
        
        await act( async() => {
            await user.click(isActive);
            await user.click(isCafe);
            await user.selectOptions(sortBy, 'date');
        });

        await waitFor(() => {
            expect(isActive.checked).toBe(true);
            expect(isCafe.checked).toBe(true);
            expect(sortBy.value).toBe('date');
        });
    });

    test('Проверяем что параметры фильтрации добавляются к url',async () => {
        api.get
            .mockResolvedValueOnce({
                data: baseData
            })
            .mockResolvedValueOnce({
                data: baseData
            })

        const { history } = renderPage();
        const user = userEvent.setup();

        const isActive = screen.getByTestId('is_active');
        const isCafe = screen.getByTestId('is_cafe');
        const sortBy = screen.getByTestId('sortby');
        
        await act( async() => {
            await user.click(isActive);
            await user.click(isCafe);
            await user.selectOptions(sortBy, 'date');
            await user.click(screen.getByTestId('submit-btn'));
        });

        await waitFor(() => {
            expect(history.location.search).toContain('?sort_by=date');
            expect(history.location.search).toContain('is_active=true');
            expect(history.location.search).toContain('is_cafe=true');
        });

    });

    test('Сохраняются ли параметры фильтрации при использовании пагинации', async () => {
        api.get
            .mockResolvedValueOnce({
                data: baseData
            })
            .mockResolvedValueOnce({
                data: baseData
            })
            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: '/api/v1/user_history_reservations/?page=3',
                    previous: '/api/v1/user_history_reservations/?page=1',
                    results: [
                        {
                            id: 5,
                            coffeehouse_name: 'Times 5',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 6,
                            coffeehouse_name: 'Times 6',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 7,
                            coffeehouse_name: 'Times 7',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                        {
                            id: 8,
                            coffeehouse_name: 'Times 8',
                            reservation_date: '2025-05-19',
                            reservation_time: '15:00:00',
                        },
                    ]
                }
            })

            .mockResolvedValueOnce({
                data: baseData
            })


        const { history } = renderPage();
        const user = userEvent.setup();

        const isActive = screen.getByTestId('is_active');
        const isCafe = screen.getByTestId('is_cafe');
        const sortBy = screen.getByTestId('sortby');
        
        await act( async() => {
            await user.click(isActive);
            await user.click(isCafe);
            await user.selectOptions(sortBy, 'date');
            await user.click(screen.getByTestId('submit-btn'));
        });

        await waitFor(() => {
            expect(history.location.search).toContain('?sort_by=date');
            expect(history.location.search).toContain('is_active=true');
            expect(history.location.search).toContain('is_cafe=true');
        });

        await user.click(screen.getByText('Вперед'));

        await waitFor(() => {
            expect(history.location.search).toContain('?sort_by=date');
            expect(history.location.search).toContain('is_active=true');
            expect(history.location.search).toContain('is_cafe=true');
            expect(history.location.search).toContain('page=2');
        })

        await user.click(screen.getByText('1'));

        await waitFor(() => {
            expect(history.location.search).toContain('?sort_by=date');
            expect(history.location.search).toContain('is_active=true');
            expect(history.location.search).toContain('is_cafe=true');
            expect(history.location.search).toContain('page=1');
        })
    })
})