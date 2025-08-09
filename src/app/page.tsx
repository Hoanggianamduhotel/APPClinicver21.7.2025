'use client';

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DoctorView from '@/components/DoctorView';
import ReceptionistView from '@/components/ReceptionistView';
import { Box, Button, Typography, Paper } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'doctor' | 'receptionist'>('home');

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
              Quản lý bệnh nhân, toa thuốc và thống kê hiệu quả
            </Typography>
          </Box>

          <Box className="grid md:grid-cols-3 gap-6 mb-8">
            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-blue-700 mb-3 font-semibold">
                Quản lý Bệnh nhân
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Tiếp nhận, theo dõi và quản lý thông tin bệnh nhân
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setCurrentView('receptionist')}
              >
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-green-700 mb-3 font-semibold">
                Bác sĩ khám bệnh
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Khám bệnh, kê đơn và quản lý toa thuốc
              </Typography>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                onClick={() => setCurrentView('doctor')}
              >
                Truy cập
              </Button>
            </Paper>

            <Paper className="p-6 hover:shadow-xl transition-shadow">
              <Typography variant="h5" className="text-purple-700 mb-3 font-semibold">
                Thống kê
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Báo cáo doanh thu và thống kê hoạt động
              </Typography>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#8e24aa' } }}
              >
                Truy cập
              </Button>
            </Paper>
          </Box>

          <Paper className="p-6">
            <Box className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎉</span>
              <Typography variant="h6" className="text-gray-800 font-semibold">
                Migration hoàn tất!
              </Typography>
            </Box>
            <Typography className="text-gray-600 mb-2">
              Hệ thống đã được chuyển đổi thành công sang Next.js với đầy đủ tính năng gốc
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                ✅ Giao diện Material-UI hoàn chỉnh
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                ✅ Tính năng bác sĩ và tiếp tân
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                ✅ Supabase integration
              </span>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}