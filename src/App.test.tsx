import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders login screen when logged out', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );
  // Default locale is Urdu
  expect(
    screen.getByText(/مقدمات اور سماعتیں منظم کرنے کے لیے سائن ان کریں/)
  ).toBeInTheDocument();
});
