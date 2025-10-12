


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

  const { cards, breakdowns, recentActivity } = dashboardData!;

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

      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(cards.totalSales.amount)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(cards.totalBookings.count)} total rides
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(cards.totalUsers.count)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(cards.activeUsers.count)} active users
            </p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(cards.totalBookings.count)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(recentActivity.newBookings)} this month
            </p>
          </CardContent>
        </Card>

        {/* Support Chats */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(cards.totalChats.count)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(recentActivity.newChats)} new chats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Driver Management Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(cards.totalDrivers.count)}</div>
            <p className="text-xs text-muted-foreground">
              Registered drivers
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-yellow-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-yellow-600">
              {formatNumber(cards.pendingDriverRequests.count)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-green-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {formatNumber(cards.activeUsers.count)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-red-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">
              {formatNumber(cards.rejectedDriverRequests.count)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rejected applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Professional Charts Section */}
      <div className="grid gap-4 ">
        {/* Revenue Trend Line Chart */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Last 6 months revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Apr', revenue: cards.totalSales.amount * 0.6 },
                  { month: 'May', revenue: cards.totalSales.amount * 0.7 },
                  { month: 'Jun', revenue: cards.totalSales.amount * 0.8 },
                  { month: 'Jul', revenue: cards.totalSales.amount * 0.9 },
                  { month: 'Aug', revenue: cards.totalSales.amount * 0.95 },
                  { month: 'Sep', revenue: cards.totalSales.amount }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#0088FE" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution Pie Chart */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(breakdowns.usersByRole).map(([role, count]) => ({
                    name: role.replace('_', ' '),
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }:any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    '#0088FE',
                    '#00C49F',
                    '#FFBB28',
                    '#FF8042'
                  ].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Bar Chart */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Current breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(breakdowns.bookingsByStatus)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([status, count]) => ({
                    status: status.replace('_', ' '),
                    count: count
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Bookings"
                  fill="#00C49F"
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Breakdown Cards */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5" />
              Recent Activity (30 days)
            </CardTitle>
            <CardDescription>Latest activity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Users</span>
              <span className="text-2xl font-bold text-blue-600">
                +{formatNumber(recentActivity.newUsers)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Bookings</span>
              <span className="text-2xl font-bold text-green-600">
                +{formatNumber(recentActivity.newBookings)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Chats</span>
              <span className="text-2xl font-bold text-purple-600">
                +{formatNumber(recentActivity.newChats)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution across user types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(breakdowns.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {role.replace('_', ' ')}
                </span>
                <span className="font-bold">{formatNumber(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Booking Status */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Current booking distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(breakdowns.bookingsByStatus)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {status.replace('_', ' ')}
                </span>
                <span className="font-bold">{formatNumber(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Payment Test Button */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Testing</CardTitle>
          <CardDescription>Test payment integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePayNow} className="w-fit">
            <CreditCard className="h-4 w-4 mr-2" />
            Test Payment (20 KWD)
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default HomePage;
