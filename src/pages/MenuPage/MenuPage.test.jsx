import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams} from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { api, fetchCSRFToken } from '../../../api';
import { act } from 'react';
import MenuPage from './MenuPage';

// vi.mock('react-router-dom',async () => ({
//     ...(await vi.importActual('react-router-dom')),
//     useSearchParams: vi.fn()
// }))



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


describe('Тест MenuPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const baseData = {
        count: 6,
        next: '/api/v1/products-menupage/?page=2',
        previous: null,
        items_per_page: 4,
        results: [
            {
                id: 1,
                image_url: 0,
                name: 'Латте 1',
                description: 'Опис 1',
                price: 20.50
            },
            {
                id: 2,
                image_url: 0,
                name: 'Латте 2',
                description: 'Опис 2',
                price: 20.50
            },
            {
                id: 3,
                image_url: 0,
                name: 'Латте 3',
                description: 'Опис 3',
                price: 20.50
            },
            {
                id: 4,
                image_url: 0,
                name: 'Латте 4',
                description: 'Опис 4',
                price: 20.50
            },
        ]
    }

    const initParametrs = ['?page=1'];

    const renderPage = (parameters = initParametrs) => {
        const history = createMemoryHistory({ initialEntries: parameters });
        return {
            ...render(
            <HistoryRouter history={history}>
                <MenuPage />
            </HistoryRouter>
            ),
            history
        };
    };

    test('Проверка наличия полей', async () => {
        api.get.mockResolvedValue({
            data: baseData
        })

        renderPage();

        await waitFor(() => {

            expect(screen.getByText('Латте 1')).toBeInTheDocument();
            expect(screen.getByText('Латте 2')).toBeInTheDocument();
            expect(screen.getByText('Латте 3')).toBeInTheDocument();
            expect(screen.getByText('Латте 4')).toBeInTheDocument();

            // Проверяем наличие двух страниц в пагинации
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            screen.debug();
        });
    });

    test("Проверка наличия полей ввода и кнопки для отправки формы", async () => {
        api.get.mockResolvedValue({
            data: baseData,
        });

        renderPage();

        expect(screen.getByPlaceholderText('Пошук по назві')).toBeInTheDocument();
        expect(screen.getByTestId('category')).toBeInTheDocument();
        expect(screen.getByTestId('filter-btn')).toBeInTheDocument();
    });

    test('Проверка изменяеются ли значения в полях при выборе', async () => {
        api.get.mockResolvedValue({
            data: baseData,
        });

        const { history } = renderPage();
        const user = userEvent.setup();

        const categorySelect = screen.getByTestId('category');
        const searchInput = screen.getByPlaceholderText('Пошук по назві');
        
        await user.selectOptions(categorySelect, 'Кава');
        
        await waitFor(() => {
            expect(categorySelect).toHaveValue('Кава');
        });

        await user.type(searchInput, 'Латте');
        
        await waitFor(() => {
            expect(searchInput).toHaveValue('Латте');
            console.log("HISTORY LOCATION SEARCH",history.location.search);
        });
    });

    test('Проверяем работу фильтров и правильно ли создаётся url', async () => {
        api.get
            .mockResolvedValue({
                data: baseData,
            })
            .mockResolvedValue({
                data: {
                    count: 0,
                    next: null,
                    previous: null,
                    items_per_page: 0,
                    results: []
                }
            });

        const { history } = renderPage();
        const user = userEvent.setup();

        const categoryValue = 'Кава';
        const searchValue = 'Латте';

        const categorySelect = screen.getByTestId('category');
        const searchInput = screen.getByPlaceholderText('Пошук по назві');
        const submitBtn = screen.getByTestId('filter-btn');
        
        await user.selectOptions(categorySelect, categoryValue);
        
        await waitFor(() => {
            expect(categorySelect).toHaveValue('Кава');
        });

        await user.type(searchInput, searchValue);
        
        await waitFor(() => {
            expect(searchInput).toHaveValue('Латте');
        });

        await act( async() => {
            await user.click(submitBtn);
        });

        await waitFor(() => {
            // expect(history.location.search).toContain('?page=1');
            console.log("HISTORY SEARCH", history.location.search);
            expect(history.location.search).toContain(`?search=${encodeURIComponent(searchValue)}`);
            expect(history.location.search).toContain(`category=${encodeURIComponent(categoryValue)}`);
        })

    });

    test('Проверяем работу пагинации',async () => {
        api.get
            .mockResolvedValueOnce({
                data: baseData,
            })

            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: null,
                    previous: '/api/v1/products-menupage/?page=1',
                    results: [
                        {
                            id: 5,
                            image_url: 0,
                            name: 'Латте 5',
                            description: 'Опис 5',
                            price: 20.50
                        },
                        {
                            id: 6,
                            image_url: 0,
                            name: 'Латте 6',
                            description: 'Опис 6',
                            price: 20.50
                        },
                    ]
                }
            })

            .mockResolvedValueOnce({
                data: baseData,
            })

            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: null,
                    previous: '/api/v1/products-menupage/?page=1',
                    results: [
                        {
                            id: 5,
                            image_url: 0,
                            name: 'Латте 5',
                            description: 'Опис 5',
                            price: 20.50
                        },
                        {
                            id: 6,
                            image_url: 0,
                            name: 'Латте 6',
                            description: 'Опис 6',
                            price: 20.50
                        },
                    ]
                }
            });
            


            const { history } = renderPage();
            const user = userEvent.setup();
            
            // Проверяем создалась ли разметка
            await waitFor(() => {
                expect(screen.getByText('Латте 1')).toBeInTheDocument();
                expect(screen.getByText('Латте 2')).toBeInTheDocument();
                expect(screen.getByText('Латте 3')).toBeInTheDocument();
                expect(screen.getByText('Латте 4')).toBeInTheDocument();
                expect(history.location.search).toContain('?page=1');
                expect(screen.getByText('Вперед')).toBeInTheDocument();
            })

            // Производим клик по пагинации вперед и проверяем наличие контента
            await act(async() => {
                await user.click(screen.getByText('Вперед'));
            })

            await waitFor(() => {
                expect(screen.getByText('Латте 5')).toBeInTheDocument();
                expect(screen.getByText('Латте 6')).toBeInTheDocument();
                expect(screen.getByText('Назад')).toBeInTheDocument();
                expect(history.location.search).toContain('?page=2');
            });

            // Проверяем перенаправление назад
            await act(async() => {
                await user.click(screen.getByText('Назад'));
            });

            await waitFor(() => {
                expect(screen.getByText('Латте 1')).toBeInTheDocument();
                expect(screen.getByText('Латте 2')).toBeInTheDocument();
                expect(screen.getByText('Латте 3')).toBeInTheDocument();
                expect(screen.getByText('Латте 4')).toBeInTheDocument();
                expect(history.location.search).toContain('?page=1');
            })

            // Находясь на первой странице проверяем заблокировано ли первая страница в цифровой пагинации а также проверям работу второй
            await act(async() => {
                await user.click(screen.getByText('1'));
            });

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
                expect(screen.getByText('Латте 1')).toBeInTheDocument();
                expect(screen.getByText('Латте 2')).toBeInTheDocument();
                expect(screen.getByText('Латте 3')).toBeInTheDocument();
                expect(screen.getByText('Латте 4')).toBeInTheDocument();
                expect(history.location.search).toContain('?page=1');
            });

            await act(async() => {
                await user.click(screen.getByText('2'));
            });

            await waitFor(() => {
                expect(screen.getByText('Латте 5')).toBeInTheDocument();
                expect(screen.getByText('Латте 6')).toBeInTheDocument();
                expect(screen.getByText('Назад')).toBeInTheDocument();
                expect(history.location.search).toContain('?page=2');
            });
    });

    test('Проверяем сохраняются ли параметры фильтрации при перемещении по пагинации', async() => {
        api.get
            .mockResolvedValueOnce({
                data: baseData,
            })

            .mockResolvedValueOnce({
                data: baseData,
            })

            .mockResolvedValueOnce({
                data: {
                    ...baseData,
                    next: null,
                    previous: '/api/v1/products-menupage/?page=1',
                    results: [
                        {
                            id: 5,
                            image_url: 0,
                            name: 'Латте 5',
                            description: 'Опис 5',
                            price: 20.50
                        },
                        {
                            id: 6,
                            image_url: 0,
                            name: 'Латте 6',
                            description: 'Опис 6',
                            price: 20.50
                        },
                    ]
                }
            })

            .mockResolvedValueOnce({
                data: baseData,
            });


        const { history } = renderPage();
        const user = userEvent.setup();

        const categoryValue = 'Кава';
        const searchValue = 'Латте';

        const categorySelect = screen.getByTestId('category');
        const searchInput = screen.getByPlaceholderText('Пошук по назві');
        const submitBtn = screen.getByTestId('filter-btn');

        await user.selectOptions(categorySelect, categoryValue);
        await user.type(searchInput, searchValue);
        await user.click(submitBtn);

        await waitFor(() => {
            expect(history.location.search).toContain(`?search=${encodeURIComponent(searchValue)}`);
            expect(history.location.search).toContain(`category=${encodeURIComponent(categoryValue)}`);
        });

        await user.click(screen.getByText('Вперед'));

        await waitFor(() => {
            expect(history.location.search).toContain(`?search=${encodeURIComponent(searchValue)}`);
            expect(history.location.search).toContain(`category=${encodeURIComponent(categoryValue)}`);
            expect(history.location.search).toContain(`page=2`);
        });

        await user.click(screen.getByText('Назад'));

        await waitFor(() => {
            expect(history.location.search).toContain(`?search=${encodeURIComponent(searchValue)}`);
            expect(history.location.search).toContain(`category=${encodeURIComponent(categoryValue)}`);
            expect(history.location.search).toContain(`page=1`);
        })
    })
})