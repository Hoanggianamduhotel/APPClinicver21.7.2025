import { Box, Typography, Paper } from "@mui/material";

interface DisplayProps {
  data: {
    ho_ten: string;
    tuoi_display: string;
    gioi_tinh: string;
    chan_doan: string;
    tong_tien: number;
  };
}

export const PatientDisplay: React.FC<DisplayProps> = ({ data }) => (
  <Paper sx={{ p: 4, bgcolor: '#f0f4f8', border: '2px solid #1976d2' }}>
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>THÔNG TIN KHÁM BỆNH</Typography>
    <Typography variant="h5">Họ tên: {data.ho_ten}</Typography>
    <Typography variant="h5">Tuổi: {data.tuoi_display} - Giới: {data.gioi_tinh}</Typography>
    <Typography variant="h5" color="error">Chẩn đoán: {data.chan_doan}</Typography>
    <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
      Tổng tiền: {data.tong_tien.toLocaleString('vi-VN')} VNĐ
    </Typography>
  </Paper>
);
