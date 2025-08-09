// src/components/DanhSachTaiKhamHomNay.tsx - Restored from original system
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';

interface KhamBenh {
  id: string;
  benhnhan_id: string;
  ngay_kham: string;
  trieu_chung: string;
  chan_doan: string;
  so_ngay_toa: number;
  status: string;
  ngay_hen_tai_kham: string;
  created_at: string;
}

export default function DanhSachTaiKhamHomNay() {
  const [data, setData] = useState<KhamBenh[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]; // '2025-08-02'
      setLoading(true);
      const { data, error } = await supabase
        .from('khambenh')
        .select(`
          id,
          benhnhan_id,
          ngay_kham,
          trieu_chung,
          chan_doan,
          so_ngay_toa,
          status,
          ngay_hen_tai_kham,
          created_at
        `)
        .eq('ngay_hen_tai_kham', today);

      if (error) {
        console.error('Lỗi truy vấn Supabase:', error);
        setData([]);
      } else {
        setData(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📋 Danh sách hẹn tái khám hôm nay
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography color="textSecondary">
          ✅ Không có bệnh nhân hẹn tái khám hôm nay.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" component="div">
                  <strong>🗓 Ngày khám:</strong> {item.ngay_kham}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>📝 Triệu chứng:</strong> {item.trieu_chung || '(trống)'}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>🔍 Chẩn đoán:</strong> {item.chan_doan || '(chưa có)'}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>💊 Số ngày toa:</strong> {item.so_ngay_toa ?? '(---)'}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>📌 Trạng thái:</strong> {item.status || '(---)'}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>📅 Hẹn tái khám:</strong> {item.ngay_hen_tai_kham}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}