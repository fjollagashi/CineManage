import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Showtimes from './pages/Showtimes';
import SeatBooking from './pages/SeatBooking';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import ReviewForm from './pages/ReviewForm';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import MoviesAdmin from './pages/admin/MoviesAdmin';
import MovieForm from './pages/admin/MovieForm';
import ShowsAdmin from './pages/admin/ShowsAdmin';
import BookingsAdmin from './pages/admin/BookingsAdmin';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import PromotionsAdmin from './pages/admin/PromotionsAdmin';
import EmployeesAdmin from './pages/admin/EmployeesAdmin';
import { ErrorBoundary } from './components/ErrorBoundary';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-[50vh] items-center justify-center bg-[#0c0c0f] text-zinc-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="movie/:id" element={<MovieDetail />} />
            <Route path="movie/:id/shows" element={<Showtimes />} />
            <Route path="movie/:id/review" element={<RequireAuth><ReviewForm /></RequireAuth>} />
            <Route path="show/:id/book" element={<RequireAuth><SeatBooking /></RequireAuth>} />
            <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="booking/:id" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />
            <Route path="bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
            <Route path="admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<BookingsAdmin />} />
              <Route path="movies" element={<MoviesAdmin />} />
              <Route path="movies/new" element={<MovieForm />} />
              <Route path="movies/:id" element={<MovieForm />} />
              <Route path="shows" element={<ShowsAdmin />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="promotions" element={<PromotionsAdmin />} />
              <Route path="employees" element={<EmployeesAdmin />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
