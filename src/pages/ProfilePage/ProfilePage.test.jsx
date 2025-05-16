import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../AuthContext.jsx';
import { api, fetchCSRFToken } from '../../../api';
import ProfilePage from './ProfilePage.jsx';


const mockNavigate = vi.fn();


vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigate,
}))


// Мокируем весь api.js модуль
vi.mock('../../../api', () => {
  // Создаем базовые моки для api
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


const logoutMock = vi.fn();


const AuthContextMock = {
    user: { name: 'Dima'},
    logout: logoutMock
}


describe('Профиль', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    const renderProfile = () => {
        return render(
            <MemoryRouter>
                <AuthContext.Provider value={AuthContextMock}>
                    <ProfilePage />
                </AuthContext.Provider>
            </MemoryRouter>
        )
    }

    test('Тестируем правильно отображение получаемых данных', async () => {
        api.get.mockResolvedValue({ data: {
            reservations: [
                {
                    id: 1,
                    coffeehouse_name: 'Times 1',
                    reservation_date: '20.01.2025',
                    reservation_time: "15:00:00",
                    status_res: 'Просрочене',
                }
            ],

            actual_reservations: [
                {
                    id: 2,
                    coffeehouse_name: 'Times 2',
                    reservation_date: '20.01.2026',
                    reservation_time: "08:00:00",
                    status_res: 'Актуальне',
                }
            ]
        }})

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText("Кав'ярня - Times 1")).toBeInTheDocument();
            expect(screen.getByText("Кав'ярня - Times 2")).toBeInTheDocument();
        })
    });

    test('Проверяем работу logout', async () => {
        const user = userEvent.setup();
        renderProfile();

        await user.click(screen.getByTestId('logout-btn'));

        await waitFor(() => {
            expect(logoutMock).toBeCalled();
        })


    });

    test('Проверяем работу кнопки истории броинрований', async () => {
        const user = userEvent.setup();
        renderProfile();

        await user.click(screen.getByTestId('reservation-history-btn'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/reservation-history')
        })
    })
})