// Topbar.tsx - Restored from original system
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Topbar: React.FC = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" noWrap>
            Hệ thống Quản lý Phòng khám
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;