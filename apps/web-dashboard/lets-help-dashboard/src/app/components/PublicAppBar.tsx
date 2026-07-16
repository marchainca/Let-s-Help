'use client';

import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/dashboard/components/ThemeToggle';

export default function PublicAppBar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Let&apos;s Help
        </Typography>

        <ThemeToggle />
        <Box sx={{ ml: 1 }}>
          <LanguageSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
