// LoginPage.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthContext } from '../../AuthContext';
import GoggleIcon from '../../components/UI/icons/GoggleIcon/GoggleIcon';
import userEvent from '@testing-library/user-event';

// Мокируем зависимости
vi.mock('../../components/UI/icons/GoggleIcon/GoggleIcon', () => ({
  default: () => <div>GoogleIcon</div>
}));

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

const AuthContextMock = {
  login: mockLogin,
  error: null
};

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (context = AuthContextMock) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={context}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('отображает все элементы формы', () => {
    renderWithContext();
    
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Логін aбо номер телефону')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toHaveAttribute('href', '/registration');
    expect(screen.getByText('GoogleIcon')).toBeInTheDocument();
  });

  test('обновляет состояние при вводе данных', async () => {
    renderWithContext();
    const user = userEvent.setup();
    
    const usernameInput = screen.getByPlaceholderText('Логін aбо номер телефону');
    const passwordInput = screen.getByPlaceholderText('Пароль');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');

    // fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    // fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    await waitFor(() => {
        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('testpass');
    });

  });

  test('вызывает login при отправке формы', async () => {
    mockLogin.mockResolvedValue(true);
    renderWithContext();
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Логін aбо номер телефону'), 'testuser');
    await user.type(screen.getByPlaceholderText('Пароль'), 'testpass');

    // fireEvent.change(screen.getByPlaceholderText('Логін aбо номер телефону'), {
    //     target: { value: 'testuser' }
    // });
    // fireEvent.change(screen.getByPlaceholderText('Пароль'), {
    //     target: { value: 'testpass' }
    // });
    // fireEvent.submit(screen.getByRole('form'));
    await user.click(screen.getByRole('button', { type: 'submit' }));

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
    });
  });

  test('перенаправляет при успешном входе', async () => {
    mockLogin.mockResolvedValue(true);
    renderWithContext()
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { type: 'submit' }));
    // fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('не перенаправляет при ошибку входа', async () => {
    mockLogin.mockResolvedValue(false);
    renderWithContext();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { type: 'submit' }));

    await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

});