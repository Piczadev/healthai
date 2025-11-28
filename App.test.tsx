import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check for the main title
        expect(screen.getByText(/BioSystem/i)).toBeInTheDocument();
        expect(screen.getByText(/Liquid/i)).toBeInTheDocument();
    });
});
