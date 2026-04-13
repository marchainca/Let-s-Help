'use client';

import React, { useState } from 'react';
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
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExtensionIcon from '@mui/icons-material/Extension';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const drawerWidth = 240;

// Altura estándar del AppBar en Material UI (por defecto ~64px en pantallas desktop)
const appBarHeight = 64;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar token y datos del usuario de localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      // Eliminar cookie de accessToken
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
    }
    // Redirigir al login
    router.push('/login');
  };

  // Alterna el estado de apertura del Drawer (menú)
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Contenido del Drawer (menú lateral)
  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Nombre o Branding */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar alt="John Restrepo" src="" />
        <Typography variant="body1" fontWeight="bold">
          John Restrepo
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {/* Item 1 */}
        <ListItemButton component={Link} href="/dashboard">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        {/* Crear Programa */}
        <ListItemButton component={Link} href="/dashboard/create-programs">
          <ListItemIcon>
            <AddBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Programa" />
        </ListItemButton>

        {/* Crear Subprograma */}
        <ListItemButton component={Link} href="/dashboard/create-subprogram">
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Subprograma" />
        </ListItemButton>

        {/* Crear Actividad */}
        <ListItemButton component={Link} href="/dashboard/create-activity">
          <ListItemIcon>
            <TaskAltIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Actividad" />
        </ListItemButton>

        {/* Reportes */}
        <ListItemButton component={Link} href="/dashboard/reports">
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reportes" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItemButton>

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>

      </List>

      <Divider />

      {/* Sección final, por ejemplo para botón Salir */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: 'red', cursor: 'pointer' }}>
          Salir
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Barra superior fija */}
      <AppBar position="fixed">
        <Toolbar>
          {/* Botón tipo hamburguesa para abrir/cerrar el Drawer */}
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
        </Toolbar>
      </AppBar>

      {/* Drawer lateral (hamburguesa) */}
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

      {/* Contenido principal con margen arriba + scroll */}
      <Box
        sx={{
          flexGrow: 1,
          marginTop: `${appBarHeight}px`,
          height: `calc(100vh - ${appBarHeight}px)`,
          overflow: 'auto', // Hace que el contenido sea scrollable
          p: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
