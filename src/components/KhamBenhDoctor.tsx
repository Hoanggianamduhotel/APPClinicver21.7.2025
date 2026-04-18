import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { supabase } from '@/lib/supabase';

// ... interface giữ nguyên ...

const KhamBenhDoctor: React.FC<KhamBenhDoctorProps> = ({ 
  setKhambenhID, 
  setKhambenh, 
  khambenh 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const trieuChungRef = useRef<HTMLDivElement>(null);
  const chanDoanRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof KhamBenh, value: string | number) => {
    setKhambenh(prev => ({ ...prev, [field]: value }));
  };

  // Logic handleSave giữ nguyên của bạn...
  const handleSave = async () => {
    if (!khambenh.benhnhan_id) return alert('Vui lòng chọn bệnh nhân!');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Phiên làm việc hết hạn!');
    if (!khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng nhập Triệu chứng và Chẩn đoán');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: khambenh.benhnhan_id,
          bacsi_id: user.id,
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id').single();

      if (insertError) throw insertError;
      setKhambenhID(data.id.toString());
      await supabase.from('danhsachcho').delete().eq('benhnhan_id', khambenh.benhnhan_id);
      alert('Đã lưu nội dung khám!');
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid container spacing={1}>
        {/* HÀNG 1: TRIỆU CHỨNG & CHẨN ĐOÁN + NÚT LƯU */}
        <Grid item xs={11.4}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField
                ref={trieuChungRef}
                fullWidth
                label="Triệu chứng"
                multiline
                rows={3}
                variant="outlined"
                value={khambenh.trieu_chung}
                onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
                placeholder="Nhập triệu chứng hiện tại..."
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                ref={chanDoanRef}
                fullWidth
                label="Chẩn đoán"
                multiline
                rows={3}
                variant="outlined"
                value={khambenh.chan_doan}
                onChange={(e) => handleInputChange('chan_doan', e.target.value)}
                placeholder="Kết luận bệnh lý..."
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* NÚT LƯU DỌC (GIỐNG ẢNH 1) */}
        <Grid item xs={0.6} sx={{ display: 'flex' }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
            sx={{ 
              minWidth: '40px', 
              p: 0, 
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              bgcolor: '#4caf50'
            }}
          >
            {isLoading ? '...' : <SaveIcon />}
          </Button>
        </Grid>

        {/* HÀNG 2: THÔNG TIN PHỤ */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
            <TextField
              label="Hẹn tái khám"
              type="date"
              size="small"
              value={khambenh.ngay_kham}
              onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 180 }}
            />
            <TextField
              label="Số ngày thuốc"
              type="number"
              size="small"
              value={khambenh.so_ngay_toa}
              onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
              sx={{ width: 120 }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
              BS: {khambenh.bacsi_id.slice(0, 8)}...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;
