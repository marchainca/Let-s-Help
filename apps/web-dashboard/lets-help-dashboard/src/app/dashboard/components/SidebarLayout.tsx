'use client';

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExtensionIcon from '@mui/icons-material/Extension';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const drawerWidth = 240;
const appBarHeight = 64;

const DASHBOARD_ROUTES = [
  '/dashboard/executive',
  '/dashboard/attendance-summary',
  '/dashboard/program-summary',
  '/dashboard/subprogram-summary',
  '/dashboard/activity-summary',
  '/dashboard/tracking-summary',
  '/dashboard/dropout-summary',
  '/dashboard/smart-alerts',
];

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false);
  const [dashboardsOpen, setDashboardsOpen] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; urlImage?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch {
        setUserData(null);
      }
    }
  }, []);

  useEffect(() => {
    if (DASHBOARD_ROUTES.some((route) => pathname.startsWith(route))) {
      setDashboardsOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
    }
    router.push('/login');
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDashboardsToggle = () => {
    setDashboardsOpen((prev) => !prev);
  };

  const homeItem = { href: '/dashboard', label: t('dashboard.nav.home'), icon: <HomeIcon /> };

  const navItems = [
    { href: '/dashboard/create-programs', label: t('dashboard.nav.createProgram'), icon: <AddBoxIcon /> },
  ];

  const dashboardItems = [
    { href: '/dashboard/executive', label: t('dashboard.nav.executive') },
    { href: '/dashboard/attendance-summary', label: t('dashboard.nav.attendanceSummary') },
    { href: '/dashboard/program-summary', label: t('dashboard.nav.programSummary') },
    { href: '/dashboard/subprogram-summary', label: t('dashboard.nav.subProgramSummary') },
    { href: '/dashboard/activity-summary', label: t('dashboard.nav.activitySummary') },
    { href: '/dashboard/tracking-summary', label: t('dashboard.nav.trackingSummary') },
    { href: '/dashboard/dropout-summary', label: t('dashboard.nav.dropoutSummary') },
    { href: '/dashboard/smart-alerts', label: t('dashboard.nav.smartAlerts') },
  ];

  const isDashboardGroupActive = DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          alt={userData?.name || t('dashboard.nav.home')}
          src={userData?.urlImage || ''}
          sx={{ width: 40, height: 40 }}
        />
        <Typography variant="body1" fontWeight="bold">
          {userData?.name || t('dashboard.nav.home')}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        <ListItemButton
          component={Link}
          href={homeItem.href}
          selected={pathname === homeItem.href}
        >
          <ListItemIcon>{homeItem.icon}</ListItemIcon>
          <ListItemText primary={homeItem.label} />
        </ListItemButton>

        <ListItemButton onClick={handleDashboardsToggle} selected={isDashboardGroupActive}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t('dashboard.nav.dashboards')} />
          {dashboardsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={dashboardsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {dashboardItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{ pl: 4 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={t('dashboard.nav.logout')} />
        </ListItemButton>
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: 'error.main', cursor: 'pointer' }} onClick={handleLogout}>
          {t('dashboard.nav.exit')}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Let&apos;s Help Colombia
          </Typography>

          <ThemeToggle />
          <Box sx={{ ml: 1 }}>
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            marginTop: `${appBarHeight}px`,
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          marginTop: `${appBarHeight}px`,
          height: `calc(100vh - ${appBarHeight}px)`,
          overflow: 'auto',
          p: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
