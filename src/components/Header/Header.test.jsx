import { describe, test, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import Header from './Header';
import { createMemoryHistory } from 'history';
import { AuthContext } from '../../AuthContext';

vi.mock('../../common/customHooks/WindowResize', () => ({
  useWindowResize: () => ({ width: 650 })
}));

describe('Компонент навигации', () => {
  let mockUser = { name: 'Test User' };
  const historyInit = createMemoryHistory({ initialPath: ['/'] });

  const Wrapper = ({ history = historyInit, user = mockUser}) => (
    <AuthContext.Provider value={{ user: user, loading: false }}>
      <Router location={history.location} navigator={history}>
        <Header />
      </Router>
    </AuthContext.Provider>
  );

  test('закрывает меню при изменении пути', async () => {
    const history = createMemoryHistory({ initialEntries: ['/initial'] });

    const { rerender } = render(<Wrapper history={history} />);

    // Открываем бургер-меню
    act(() => {
      screen.getByTestId('burger').click();
    });
    
    // Проверяем открытие меню
    expect(screen.getByTestId('mobile-menu')).toHaveClass('active');

    // Перерендерим с новым путём
    act(() => {
      history.push('/new-path')
    });

    rerender(<Wrapper history={history} />)

    // Проверяем закрытие меню
    await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).not.toHaveClass('active');
    })
  });

  test('Тестируем наличие ссылок при указанном пользователе',async () => {
    render(<Wrapper />);

    expect(screen.getAllByText('Меню')).toHaveLength(2); 
    expect(screen.getAllByText("Мапа кав'ярень")).toHaveLength(2); 
    expect(screen.getAllByText('Профіль')).toHaveLength(2); 

    expect(screen.queryByText('Мої бронювання')).not.toBeInTheDocument();
    expect(screen.queryByText('Увійти')).not.toBeInTheDocument();
    expect(screen.queryByText('Зарееструватися')).not.toBeInTheDocument();
  });

  test('Тестируем что при отсуцтвии пользователя не будет отображатся профиль', async () => {
    let mockUser = null;
    render(<Wrapper user={mockUser} />);

    expect(screen.queryByText('Профіль')).not.toBeInTheDocument();

    expect(screen.getAllByText('Мої бронювання')).toHaveLength(2); 
    expect(screen.getAllByText('Увійти')).toHaveLength(2); 
    expect(screen.getAllByText('Зарееструватися')).toHaveLength(2); 
  })
});