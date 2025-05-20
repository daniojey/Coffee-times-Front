import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { act, useRef, useEffect } from 'react';

import { api, fetchCSRFToken } from '../../../api';
import MapPage from "./MapPage"


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

const flyToMock = vi.fn()

const useMapMock = {
    flyTo: flyToMock,
}

let mockMarkers = []

const markerMethods = (position) => ({
  getLatLng: vi.fn(() => position),
  openPopup: vi.fn(),
  closePopup: vi.fn(),
});

vi.mock('react-leaflet', async () => {
    const actual = await vi.importActual('react-leaflet');
    return {
        ...actual,
        MapContainer: ({
            center,
            zoom,
            scrollWheelZoom,
            children,
            ...props
        }) => (
            <div
                data-testid='map-container'
                data-center={JSON.stringify(center)}
                data-zoom={zoom}
                data-scroll-whill-zoon={scrollWheelZoom}
                {...props}
            >
                { children }
            </div>
        ),
        TileLayer: ({ url, attribution }) => (
            <div
                data-testid='tile-layer'
                data-url={url}
                data-attribution={attribution}
            />
        ),
        Marker: ({ position, id, key, ref ,children }) => {
            console.log('ПОЗИЦИЯ', id , position)
            const marker = {
                ...markerMethods(position),
                _leaflet_id: id,
                position: position,
                id: id
            };

            // Сохраняем маркер в хранилище
            useEffect(() => {
                mockMarkers.push(marker);
                return () => {
                mockMarkers = mockMarkers.filter(m => m.id !== id);
                };
            }, []);

            useEffect(() => {
                if (ref) {
                ref(marker);
                }
            }, [ref]);

            return(
                <div
                    data-testid='marker'
                    data-position={JSON.stringify(position)}
                    data-id={id}
                    data-key={key}
                >
                    {children}
                </div>
            )},
        Popup: ({ children }) => (
            <div data-testid="popup">
                { children }
            </div>
        ),
        useMap: () => useMapMock
    }
})


describe("Тестирование MapPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    const renderPage = () => {
    mockMarkers = []; // Очищаем хранилище перед каждым тестом
    return {
        ...render(
        <MemoryRouter>
            <MapPage />
        </MemoryRouter>
        ),
        markers: mockMarkers
    };
    };
        

    const baseData = [
        {
            id: 1,
            image_url: 0,
            location: { 'lat': 48.51, 'lng': 34.63 },
            name: 'Name times 1',
            address: 'times 1',
            opening_time: '10:00:00',
            closing_time: "15:00:00",
        },
        {
            id: 2,
            image_url: 0,
            location: { 'lat': 49.51, 'lng': 35.63 },
            name: 'Name times 2',
            address: 'times 2',
            opening_time: '10:00:00',
            closing_time: "15:00:00",
        },
        
    ]

    test('Проверяем отрисовку страницы', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                results:baseData
            }
        });

        renderPage();
        
        await waitFor(() => {
            expect(screen.getByText('times 1')).toBeInTheDocument();
            expect(screen.getByText('times 2')).toBeInTheDocument();
            screen.debug();
        })
    });

    test('Проверяем наличие всех полей для ввода и проверяем работает ли заполнение поля поиска',async () => {
        api.get.mockResolvedValueOnce({
            data: {
                results: baseData
            }
        });

        renderPage();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Введіть адрессу кав'ярні")).toBeInTheDocument();
            expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText("Введіть адрессу кав'ярні"), "times 1");

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Введіть адрессу кав'ярні").value).toBe('times 1');
        });

    });

    test('Проверка работы поиска', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                results: baseData
            }
        });

        renderPage();

        const user = userEvent.setup();

        await act(async () => {
            await user.type(screen.getByPlaceholderText("Введіть адрессу кав'ярні"), "times 1");
            await user.click(screen.getByTestId('submit-btn'));
        });

        await waitFor(() => {
            const element = screen.getAllByText('Адресса: times 1');

            expect(element).toHaveLength(2);
        });
    });

    test('Проверка работы flyTo при клике на елемент в рекомендациях', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                results: baseData
            }
        });

        const { markers } = renderPage();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('Адресса: times 1')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Адресса: times 1'));

        await waitFor(() => {
            const firstMarker = markers.find(m => m.id === 1);

            expect(useMapMock.flyTo).toHaveBeenCalled();
            expect(useMapMock.flyTo).toHaveBeenCalledWith({ 'lat': 48.51, 'lng': 34.63 }, 13);
            expect(firstMarker.getLatLng).toHaveBeenCalled();
            expect(firstMarker.getLatLng()).toEqual({ 'lat': 48.51, 'lng': 34.63 });
            expect(firstMarker.openPopup).toHaveBeenCalled();
        });

    });

    test('Проверяем работает ли клик на результат поиска', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                results: baseData
            }
        });

        const { markers } = renderPage();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Введіть адрессу кав'ярні"))
        });

        await act(async () => {
            await user.type(screen.getByPlaceholderText("Введіть адрессу кав'ярні"), "times 2");
            await user.click(screen.getByTestId('submit-btn'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('0-house 2')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('0-house 2'));

        await waitFor(() => {
            const firstMarker = markers.find(m => m.id === 2);

            expect(useMapMock.flyTo).toHaveBeenCalled();
            expect(useMapMock.flyTo).toHaveBeenCalledWith({ 'lat': 49.51, 'lng': 35.63 }, 13);
            expect(firstMarker.getLatLng).toHaveBeenCalled();
            expect(firstMarker.getLatLng()).toEqual({ 'lat': 49.51, 'lng': 35.63 });
            expect(firstMarker.openPopup).toHaveBeenCalled();
        });
    })
});
