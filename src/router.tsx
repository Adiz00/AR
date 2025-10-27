import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
// import HomePage from '@/pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
// import BooksPage from './pages/BooksPage';
import AuthLayout from './layouts/AuthLayout';
import TryOnAvatar from './pages/tryOnAvatar.tsx';
import FashionNews from './pages/fashionNews.tsx';
import ImageAiSearch from './pages/imageAiSearch.tsx';


const router = createBrowserRouter([
    // {
    //     path: '/',
    //     element: <Navigate to="/dashboard" />,
    // },
    
    {
            path: '/',
            element: <Navigate to="/dashboard" />,
            // element: <LandingPage />,
    },
    // {
    //         path: 'register-driver',
    //         element: <RegisterDriver />,
    // },
    // {
    //             path: 'payment-status',
    //             element: <PaymentStatus />,
    // },
    {
        // path: '/landing',
        // element: <LandingPage />,  
},
    {
        path: '',
        element: <DashboardLayout />,
        children: [
            {
                path: 'dashboard',
                element: <TryOnAvatar />,
            },
            {
                path: 'try-on-avatar',
                element: <TryOnAvatar />,
            },
            {
                path: 'fashion-news',
                element: <FashionNews />,
            },
            {
                path: 'image-ai-search',
                element: <ImageAiSearch />,
            },
        ],
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
            // {
            //     path: 'forget-password',
            //     element: <ForgetPasswordPage />,
            // },
            // {
            //     path: 'verify-otp',
            //     element: <VerifyOtpPage />,
            // },
            // {
            //     path: 'register-driver',
            //     element: <RegisterDriver />,
            // },
        ],
    },
], 
{
    basename: '/',  // ✅ set basename here, as the second argument
});

export default router;
