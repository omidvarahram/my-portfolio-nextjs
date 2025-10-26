import { render, screen } from '@testing-library/react';
import Home from './index';

test('renders welcome message', () => {
  render(<Home />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
