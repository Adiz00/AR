                          
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useTokenStore from '@/store';
import {
    Bell,
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package,
    Package2,
    Search,
    ShoppingCart,
    Users,
    Car,
    UserCog,
    Building2,
    ShieldCheck,
    CarFront,
    Loader2
} from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/blackLogo.svg'; 
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const user = useTokenStore((state) => state.user);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token, setToken } = useTokenStore((state) => state);
    // Socket.io client
    const [socket, setSocket] = useState<any>(null);
    // sidebar collapsed state (desktop)
    const [collapsed, setCollapsed] = useState(false);

   

    // Clear search when route changes

    // if (token === '') {
    //     return <Navigate to={'/auth/login'} replace />;
    // }

    const logout = () => {
        console.log('Logging out!');
        setToken('');
        navigate('/auth/login');
        toast({
          className: "text-black border-2 border-green-600 shadow-lg rounded-lg h-16",  
          title: "Logout successful",
        //   description: "Welcome back!",
        });
    };

    return (
      <div
        className={`grid min-h-screen w-full ${
          collapsed
            ? "md:grid-cols-[72px_1fr] lg:grid-cols-[72px_1fr]"
            : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
        }`}
      >
        <div
          className={`hidden border-r bg-muted/40 md:block ${
            collapsed ? "w-20" : ""
          }`}
        >
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <img
                  src={logo}
                  alt="Royal Ride"
                  className={`${
                    collapsed
                      ? "h-8 w-8"
                      : "h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12"
                  }`}
                />
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => {
                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive && "bg-gray-100 text-primary"
                    }`;
                  }}
                >
                  <Home className="h-4 w-4" />
                  {!collapsed && "Home"}
                </NavLink>

                {/* <NavLink
                                to="/try-on-avatar"
                                className={({ isActive }) => {
                                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                                        isActive && 'bg-gray-100 text-primary'
                                    }`;
                                }}>
                                <ShieldCheck className="h-4 w-4" />
                                {!collapsed && 'Try On Avatar'}
                            </NavLink> */}
                <NavLink
                  to="/fashion-news"
                  className={({ isActive }) => {
                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive && "bg-gray-100 text-primary"
                    }`;
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {!collapsed && "Fashion News"}
                </NavLink>
                <NavLink
                  to="/image-ai-search"
                  className={({ isActive }) => {
                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive && "bg-gray-100 text-primary"
                    }`;
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {!collapsed && "Image + AI Search"}
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((v) => !v)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            
            <div className="flex items-center gap-4 ml-auto">
            <Button
              className="bg-blue-500 text-white"
              onClick={() => navigate("/avatar-canvas")}
            >
              Try On Avatar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[220px] p-2 rounded-xl shadow-lg bg-white border border-gray-100"
              >
                <div className="flex flex-col items-center gap-2 py-2 border-b border-gray-100 mb-2">
                  <CircleUser className="h-6 w-6 text-gray-500 mb-1" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {user?.email}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mt-1">
                    {user?.role?.replace(/_/g, " ")}
                  </span>
                </div>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Link
                    to="/change-password"
                    className="flex items-center gap-2 w-full"
                  >
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <span>Change Password</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer">
                                <Settings className="h-4 w-4 text-gray-400" />
                                <span>Settings</span>
                            </DropdownMenuItem> */}
                {/* <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer">
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                                <span>Support</span>
                            </DropdownMenuItem> */}
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={logout}
                >
                  <span className="flex items-center gap-2 text-red-600 font-medium">
                    <Loader2 className="h-4 w-4 text-red-500" /> Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    );
};

export default DashboardLayout;
