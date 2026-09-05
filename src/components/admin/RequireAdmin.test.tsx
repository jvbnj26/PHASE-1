import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAdmin from './RequireAdmin';

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<div>Admin Login Page</div>} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAdmin', () => {
  beforeEach(() => mockUseAuth.mockReset());

  it('renders nothing while auth/role status is still loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: true });
    const { container } = renderAt('/admin/dashboard');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects unauthenticated users to /admin', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: false });
    renderAt('/admin/dashboard');
    expect(screen.getByText('Admin Login Page')).toBeInTheDocument();
  });

  it('redirects authenticated non-admin users to /admin', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false });
    renderAt('/admin/dashboard');
    expect(screen.getByText('Admin Login Page')).toBeInTheDocument();
  });

  it('renders the protected route for authenticated admins', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false });
    renderAt('/admin/dashboard');
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
