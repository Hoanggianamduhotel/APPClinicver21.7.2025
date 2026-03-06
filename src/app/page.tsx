'use client';

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Typography, Paper, TextField, CssBaseline } from '@mui/material';
import DoctorView from '@/components/DoctorView';
import ReceptionistView from '@/components/ReceptionistView';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'doctor' | 'receptionist'>('home');
  // 1. Thêm trạng thái kiểm tra mật khẩu
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // 2. Hàm kiểm tra mật khẩu (Bạn hãy đổi '123456' thành mật khẩu bạn muốn)
  const handleLogin = () => {
    if (password === '123456') {
      setIsLoggedIn(true);
    } else {
      alert('Mật khẩu không đúng!');
    }
  };

  // Nếu chưa đăng nhập, hiện Form nhập Pass
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)' }}>
          <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Đăng nhập Hệ thống</Typography>
            <TextField
              fullWidth
              type="password"
              label="Nhập mã truy cập"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button fullWidth variant="contained" size="large" onClick={handleLogin}>
              Xác nhận
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // --- Sau khi đăng nhập xong mới hiện phần dưới đây ---

  if (currentView === 'doctor') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DoctorView />
      </ThemeProvider>
    );
  }

  if (currentView === 'receptionist') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReceptionistView />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <Box className="max-w-4xl mx-auto">
          <Box className="text-center mb-8">
            <Typography variant="h3" className="text-gray-800 mb-2 font-bold">
              Hệ thống Quản lý Phòng khám
            </Typography>
            <Typography variant="h6" className="text-gray-600">
              Chào mừng bạn đã đăng nhập thành công
            </Typography>
          </Box>

          <Box className="grid md:grid-cols-3 gap-6 mb-8">
            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-blue-700 mb-3 font-semibold">Quản lý Bệnh nhân</Typography>
              <Button variant="contained" color="primary" onClick={() => setCurrentView('receptionist')}>
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-green-700 mb-3 font-semibold">Bác sĩ khám bệnh</Typography>
              <Button variant="contained" sx={{ backgroundColor: '#4caf50' }} onClick={() => setCurrentView('doctor')}>
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-purple-700 mb-3 font-semibold">Thống kê</Typography>
              <Button variant="contained" sx={{ backgroundColor: '#9c27b0' }}>
                Truy cập
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
