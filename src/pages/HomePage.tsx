


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  ArrowUpRight, 
  CreditCard, 
  DollarSign, 
  Users, 
  Car, 
  MessageSquare, 
  UserCheck, 
  UserX,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/http/api';
interface DashboardStats {
  cards: {
    totalUsers: { count: number; title: string; subtitle: string };
    activeUsers: { count: number; title: string; subtitle: string };
    totalDrivers: { count: number; title: string; subtitle: string };
    pendingDriverRequests: { count: number; title: string; subtitle: string };
    rejectedDriverRequests: { count: number; title: string; subtitle: string };
    totalBookings: { count: number; title: string; subtitle: string };
    totalSales: { amount: number; title: string; subtitle: string };
    totalEarning: { amount: number; title: string; subtitle: string };
    totalChats: { count: number; title: string; subtitle: string };
  };
  breakdowns: {
    usersByRole: Record<string, number>;
    driversByStatus: Record<string, number>;
    bookingsByStatus: Record<string, number>;
  };
  recentActivity: {
    newUsers: number;
    newBookings: number;
    newChats: number;
  };
}

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setDashboardData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handlePayNow = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/create-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 20,
          currency: "KWD",
          customer: {
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            phone: { country_code: "965", number: "50000000" },
          },
          metadata: {
            user_id: "687588a5042653985ad7d152"
          },
        })
      });
      const data = await response.json();
      if (data.transaction?.url) {
        window.location.href = data.transaction.url;
      }
    } catch (err) {
      alert('Payment initiation failed');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>


      
    </main>
  );
};

export default HomePage;
