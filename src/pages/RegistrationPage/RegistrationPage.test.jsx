// RegistrationPage.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegistrationPage from './RegistrationPage.jsx';
import { AuthContext } from '../../AuthContext';
import GoggleIcon from '../../components/UI/icons/GoggleIcon/GoggleIcon';
import userEvent from '@testing-library/user-event';


vi.mock('../../components/UI/icons/GoggleIcon/GoggleIcon', () => ({
  default: () => <div>GoogleIcon</div>
}));


const registarationMock = vi.fn();
const navigatemock = vi.fn();


const AuthContextMock = {
    registration: registarationMock,
    error: null,
}


vi.mock('react-router-dom',async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => navigatemock,
    Link: ({ children, to }) => <a href={to}>{children}</a>
}))


describe('RegisrationPage', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });


    const renderWithContext = (context = AuthContextMock) => {
        return render(
        <MemoryRouter>
            <AuthContext.Provider value={context}>
                <RegistrationPage />
            </AuthContext.Provider>
        </MemoryRouter>
        );
    };


    test('Проверка отображения основных елементов', () => {
        renderWithContext();

        expect(screen.getByPlaceholderText('Логін')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Номер телефону')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Повторіть пароль')).toBeInTheDocument();
    });

    test('Проверка изменений изменения значений', async () => {
        renderWithContext()
        const user = userEvent.setup();

        const username = screen.getByPlaceholderText('Логін');
        const phone = screen.getByPlaceholderText('Номер телефону');
        const password1 = screen.getByPlaceholderText('Пароль');
        const password2 = screen.getByPlaceholderText('Повторіть пароль');


        await user.type(username, 'testuser');
        await user.type(phone, '380966344265');
        await user.type(password1, 'testpass1234');
        await user.type(password2, 'testpass1234');
        // fireEvent.change(username, { target: { value: 'testuser' }});
        // fireEvent.change(phone, { target: { value: '380966344265' }});
        // fireEvent.change(password1, { target: { value: 'testpass1234' }});
        // fireEvent.change(password2, { target: { value: 'testpass1234' }});

        expect(username.value).toBe('testuser');
        expect(phone.value).toBe('380966344265');
        expect(password1.value).toBe('testpass1234');
        expect(password2.value).toBe('testpass1234');
    });

    test('Проверка что форма отправляется', async () => {
        registarationMock.mockResolvedValue(true);
        renderWithContext()
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText('Логін'), 'testuser');
        await user.type(screen.getByPlaceholderText('Номер телефону'), '380966344265');
        await user.type(screen.getByPlaceholderText('Пароль'), 'testpass1234');
        await user.type(screen.getByPlaceholderText('Повторіть пароль'), 'testpass1234');
        
        await user.click(screen.getByRole('button', { type: 'submit' }));

        // Логируем все вызовы мок-функции
        console.log('Calls to registarationMock:', registarationMock.mock.calls);

        await waitFor(() => {
            expect(registarationMock).toHaveBeenNthCalledWith(1,'testuser', '380966344265', 'testpass1234', 'testpass1234');
        });
    });

    test('Проверяем перенаправление при успешной регистрации', async () => {
        registarationMock.mockResolvedValue(true);
        renderWithContext();
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { type: 'submit' }));

        await waitFor(() => {
            expect(navigatemock).toHaveBeenCalledWith('/');
        });
    });

    test('Проверяем что перенаправления нет при неудачной регистрации', async () => {
        registarationMock.mockResolvedValue(false);
        renderWithContext();
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { type: 'submit' }));

        await waitFor(() => {
            expect(navigatemock).not.toHaveBeenCalledWith();
        });
    })
})