import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api, fetchCSRFToken } from '../../../api';
import SearchReservationPage from './SearchReservationPage.jsx';

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


global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })).mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));


describe('Страница поиска резерваций', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = () => {
        render(<SearchReservationPage />);
    };

    test('Проверяем наличие функциональных полей',async () => {
        const user = userEvent.setup();
        renderPage();

        expect(screen.getByPlaceholderText('Enter number..')).toBeInTheDocument();
        expect(screen.getByTestId('checkbox-actual')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Search'}));
    });

    test('Проверка отправки запроса',async () => {
        renderPage();
        const user = userEvent.setup();

        api.post.mockResolvedValue({ data: {
            reservations: [
                {
                    id: 1,
                    reservation_date: '20.01.2025',
                    reservation_time: "15:00:00",
                    table_number: 2,
                    seats: 4,
                    streaming_status: 'Просрочене',
                }, 
                {
                    id: 2,
                    reservation_date: '20.01.2026',
                    reservation_time: "10:00:00",
                    table_number: 1,
                    seats: 2,
                    streaming_status: 'Просрочене',
                }
            ]
        }});

        const phoneInput = screen.getByPlaceholderText('Enter number..');
        const submitBtn = screen.getByRole('button', { name: 'Search'});
        const actualCheckbox = screen.getByTestId('checkbox-actual');

        // Сначала вводим телефон
        await user.type(phoneInput, '380966344260');

        await waitFor(() => {
            expect(phoneInput.value).toBe('380966344260');
        });

        // После нажимание на кнопку поиска и ждём отображения карточек
        await user.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Номер столика: 1')).toBeInTheDocument();
            expect(screen.getByText('Номер столика: 2')).toBeInTheDocument();
        });


        expect(actualCheckbox.checked).toBe(false);

        expect(api.post).toHaveBeenCalledWith(
            'api/v1/reservations_search/',
            { actual: false, phone:'380966344260'}, 
            expect.anything()  // Игнорируем конфиг (3й аргумент)
        );
    });

    
    test('Проверка работы чекбокса', async () => {
        renderPage();
        const user = userEvent.setup();

        const actualCheckbox = screen.getByTestId('checkbox-actual');
        
        expect(actualCheckbox.checked).toBe(false);

        await user.click(actualCheckbox);

        await waitFor(() =>  {
            expect(actualCheckbox.checked).toBe(true);
        });
    });
})