'use client';

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Typography, Paper, TextField, CssBaseline, CircularProgress } from '@mui/material';
import DoctorView from '@/components/DoctorView';
import ReceptionistView from '@/components/ReceptionistView';
import { supabase } from '@/lib/supabase'; // Đảm bảo bạn đã có file config này

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'doctor' | 'receptionist'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Trạng thái đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hàm đăng nhập thật qua Supabase
  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert('Lỗi đăng nhập: ' + error.message);
    } else {
      setIsLoggedIn(true);
      console.log("Đã đăng nhập với ID:", data.user?.id);
    }
    setLoading(false);
  };

  // 1. Giao diện Đăng nhập
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)' }}>
          <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Đăng nhập HIS</Typography>
            
            <TextField
              fullWidth
              label="Email bác sĩ"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="bschinh@gmail.com"
            />
            
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // 2. Các View sau khi đã đăng nhập thành công
  if (currentView === 'doctor') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Truyền thông tin bác sĩ vào nếu cần */}
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
          <Box className="text-right mb-4">
             <Button variant="outlined" color="error" onClick={() => supabase.auth.signOut().then(() => setIsLoggedIn(false))}>
                Đăng xuất
             </Button>
          </Box>
          <Box className="text-center mb-8">
            <Typography variant="h3" className="text-gray-800 mb-2 font-bold">
              Hệ thống Quản lý Phòng khám
            </Typography>
            <Typography variant="h6" className="text-gray-600">
              Bác sĩ đang hoạt động: {email}
            </Typography>
          </Box>

          <Box className="grid md:grid-cols-3 gap-6 mb-8">
            <Paper className="p-6 hover:shadow-xl transition-shadow text-center">
              <Typography variant="h5" className="text-blue-700 mb-3 font-semibold">Tiếp nhận</Typography>
              <Button variant="contained" color="primary" onClick={() => setCurrentView('receptionist')}>
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow text-center">
              <Typography variant="h5" className="text-green-700 mb-3 font-semibold">Bác sĩ khám</Typography>
              <Button variant="contained" sx={{ backgroundColor: '#4caf50' }} onClick={() => setCurrentView('doctor')}>
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow text-center">
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
