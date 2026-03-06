// KhamBenhDoctor.tsx - Đã sửa lỗi UUID và ép kiểu Grid
import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { supabase } from '@/lib/supabase';

interface KhamBenh {
  benhnhan_id: string;
  bacsi_id: string;
  ngay_kham: string;
  trieu_chung: string;
  chan_doan: string;
  so_ngay_toa: number;
}

interface KhamBenhDoctorProps {
  setKhambenhID: (id: string | null) => void;
  setKhambenh: React.Dispatch<React.SetStateAction<KhamBenh>>;
  khambenh: KhamBenh;
}

const KhamBenhDoctor: React.FC<KhamBenhDoctorProps> = ({ 
  setKhambenhID, 
  setKhambenh, 
  khambenh 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof KhamBenh, value: string | number) => {
    setKhambenh(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!khambenh.benhnhan_id) {
      alert('Vui lòng chọn bệnh nhân từ danh sách chờ trước!');
      return;
    }
    if (!khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng điền đầy đủ triệu chứng và chẩn đoán');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Lưu vào bảng khambenh
      // LƯU Ý: KHÔNG dùng parseInt cho benhnhan_id vì nó là UUID (string)
      const { data, error: insertError } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: khambenh.benhnhan_id, // Truyền trực tiếp string UUID
          bacsi_id: "00000000-0000-0000-0000-000000000000", // Thay bằng UUID bác sĩ thật nếu có, hoặc để string hợp lệ
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Lưu lại ID của lượt khám vừa tạo để làm toa thuốc
      setKhambenhID(data.id.toString());
      
      // 2. Xóa bệnh nhân khỏi danh sách chờ sau khi đã khám xong
      // LƯU Ý: KHÔNG dùng parseInt tại đây
      const { error: deleteError } = await supabase
        .from('danhsachcho')
        .delete()
        .eq('benhnhan_id', khambenh.benhnhan_id);

      if (deleteError) {
        console.warn('Cảnh báo: Không thể xóa khỏi danh sách chờ:', deleteError.message);
      }

      alert('Đã lưu thông tin khám bệnh thành công!');
    } catch (error: any) {
      console.error('Lỗi khi lưu khám bệnh:', error);
      alert('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Nội dung thăm khám
      </Typography>
      
      <Grid container spacing={2}>
        <Grid {...({ item: true, xs: 12, md: 6 } as any)}>
          <TextField
            fullWidth
            label="Triệu chứng"
            placeholder="Nhập triệu chứng lâm sàng..."
            multiline
            rows={3}
            value={khambenh.trieu_chung}
            onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
          />
        </Grid>
        
        <Grid {...({ item: true, xs: 12, md: 6 } as any)}>
          <TextField
            fullWidth
            label="Chẩn đoán"
            placeholder="Nhập chẩn đoán bệnh..."
            multiline
            rows={3}
            value={khambenh.chan_doan}
            onChange={(e) => handleInputChange('chan_doan', e.target.value)}
          />
        </Grid>
        
        <Grid {...({ item: true, xs: 12, sm: 6, md: 4 } as any)}>
          <TextField
            fullWidth
            label="Ngày khám"
            type="date"
            value={khambenh.ngay_kham}
            onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid {...({ item: true, xs: 12, sm: 6, md: 4 } as any)}>
          <TextField
            fullWidth
            label="Số ngày thuốc"
            type="number"
            value={khambenh.so_ngay_toa}
            onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
          />
        </Grid>
        
        <Grid {...({ item: true, xs: 12, md: 4 } as any)} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
            sx={{ height: '56px', fontWeight: 'bold' }}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu kết quả khám'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;
