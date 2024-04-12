import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import LoginScreen from './LoginScreen';

const mockStore = configureStore([]);

describe('LoginScreen Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        userInfo: null,
      },
    });
  });

  test('Test 1: Valid username and password', async () => {
    // Mock login function and response
    const loginResponse = { token: 'mock-token' };
    const login = jest.fn().mockResolvedValue(loginResponse);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login to be called and JWT to be generated
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));

    // Verify redirection to intended page
    expect(window.location.pathname).toBe('/');
  });

  test('Test 2: Empty username or password', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('Test 3: Invalid username', async () => {
    const login = jest.fn().mockRejectedValue({ data: { message: 'Invalid credentials' } });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('Test 4: Invalid password', async () => {
    // Mock login function to throw error
    const login = jest.fn().mockRejectedValue({ data: { message: 'Invalid credentials' } });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'invalidpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message to be displayed
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
