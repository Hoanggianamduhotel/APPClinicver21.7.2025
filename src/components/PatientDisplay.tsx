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
  <Paper sx={{ p: 3, bgcolor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: 2 }}>
    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>MÀN HÌNH BỆNH NHÂN</Typography>
    <Typography variant="h5">Họ tên: {data.ho_ten.toUpperCase()}</Typography>
    <Typography variant="body1">Tuổi: {data.tuoi_display} | Giới: {data.gioi_tinh}</Typography>
    <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 600 }}>Chẩn đoán: {data.chan_doan || "---"}</Typography>
    <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold', color: '#2e7d32' }}>
      Tổng tiền: {data.tong_tien.toLocaleString('vi-VN')} VNĐ
    </Typography>
  </Paper>
);
