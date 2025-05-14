import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import ProductHomePage from './ProductHomePage';
import { truncateString } from '../../common/scripts/truncate';

const mockProduct = {
    image_url: 'test-image.jpg',
    name: 'Латте',
    description: 'Очень длинное описание напитка, которое должно быть обрезано функцией truncateString',
    price: 20.50,
};


describe('ProductHomePage component test', () => {
    test('Коректность рендера елементов компонента', () => {
        render(<ProductHomePage data={mockProduct} />);

        // Проверка изображения
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', mockProduct.image_url);

        // Проверка названия
        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();

        // Проверка усеченного описания 
        const truncatedDescriptions = truncateString(mockProduct.description, 70);
        expect(screen.getByText(truncatedDescriptions)).toBeInTheDocument();

        // Проверка цены
        expect(screen.getByText(`Ціна ${mockProduct.price}грн`)).toBeInTheDocument();
    });

    test('Корректная структура DOM', () => {
        render(<ProductHomePage data={mockProduct} />);

        // Проверка основных контейнеров
        expect(screen.getByTestId('productId')).toBeInTheDocument();

        const { container } = render(<ProductHomePage data={mockProduct} />);
        expect(container.querySelector('.slide-item')).toBeInTheDocument();
        expect(container.querySelector('.product__name_description')).toBeInTheDocument();
        expect(container.querySelector('.product__price')).toBeInTheDocument();
    })

    test('Проверка сокращения описания', () => {
        const longDescription = 'a'.repeat(100);
        const testProduct = { ...mockProduct, description: longDescription}

        render(<ProductHomePage data={testProduct}/>)

        const expectedText = truncateString(longDescription, 70);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    })
})