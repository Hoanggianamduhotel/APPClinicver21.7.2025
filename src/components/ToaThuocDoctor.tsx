import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Paper, IconButton, Typography,
  Autocomplete, Card, CardContent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, History as HistoryIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface ToaThuocDoctorProps {
  khambenhID: string;
}

interface ThuocDanhMuc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  gia_ban: number;
}

interface MedicationRow {
  id: number;
  thuoc_id: string;
  ten_thuoc: string;
  don_vi: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  ghi_chu: string;
}

const ToaThuocDoctor: React.FC<ToaThuocDoctorProps> = ({ khambenhID }) => {
  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const [savedToa, setSavedToa] = useState<any[]>([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState<ThuocDanhMuc[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch dữ liệu từ Supabase
  const fetchData = useCallback(async () => {
    if (!khambenhID) return;

    // Load kho thuốc
    const { data: kho } = await supabase
      .from('thuoc')
      .select('id, ten_thuoc, don_vi, duong_dung, gia_ban')
      .order('ten_thuoc');
    if (kho) setDanhMucThuoc(kho);

    // Load toa thuốc đã kê cho phiên khám này
    const { data: daKe } = await supabase
      .from('toathuoc')
      .select(`
        *,
        thuoc:thuoc_id(ten_thuoc)
      `)
      .eq('khambenh_id', khambenhID);
    if (daKe) setSavedToa(daKe);
  }, [khambenhID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kiểm tra thời gian 20 phút (logic nghiệp vụ HIS)
  const checkEditTime = async () => {
    const { data: visit } = await supabase
      .from('khambenh')
      .select('created_at')
      .eq('id', khambenhID)
      .single();
    
    if (visit) {
      const diff = (new Date().getTime() - new Date(visit.created_at).getTime()) / 60000;
      return diff <= 20;
    }
    return false;
  };

  const handleAddRow = () => {
    setMedications([...medications, {
      id: Date.now(),
      thuoc_id: '',
      ten_thuoc: '',
      don_vi: '',
      so_lan_dung: 2,
      so_luong_moi_lan: 1,
      ghi_chu: '',
    }]);
  };

  const handleSave = async () => {
    const canEdit = await checkEditTime();
    if (!canEdit) {
      alert('⚠️ Tờ điều trị đã khóa (quá 20 phút). Hãy tạo tờ điều trị mới!');
      return;
    }

    setIsSaving(true);
    try {
      const toInsert = medications
        .filter(m => m.thuoc_id)
        .map(med => {
          const thuocGoc = danhMucThuoc.find(t => t.id === med.thuoc_id);
          const tong_sl = Number(med.so_lan_dung) * Number(med.so_luong_moi_lan);
          return {
            khambenh_id: khambenhID,
            thuoc_id: med.thuoc_id,
            so_lan_dung: Number(med.so_lan_dung),
            so_luong_moi_lan: Number(med.so_luong_moi_lan),
            tong_so_luong: tong_sl,
            don_vi: med.don_vi,
            ghi_chu: med.ghi_chu,
            thanh_tien: (thuocGoc?.gia_ban || 0) * tong_sl,
            trang_thai: 'Chờ'
          };
        });

      const { error } = await supabase.from('toathuoc').insert(toInsert);
      if (error) throw error;

      alert('Đã lưu toa thuốc vào hồ sơ!');
      setMedications([]);
      fetchData();
    } catch (err: any) {
      alert('Lỗi lưu dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    const canEdit = await checkEditTime();
    if (!canEdit) {
      alert('⚠️ Đã quá 20 phút, y lệnh thuốc đã được chốt, không thể xóa!');
      return;
    }

    if (window.confirm('Hủy thuốc này khỏi tờ điều trị?')) {
      const { error } = await supabase.from('toathuoc').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KHU VỰC 1: NHẬP Y LỆNH MỚI */}
      <Card variant="outlined" sx={{ borderColor: '#1976d2', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon fontSize="small" /> THÊM Y LỆNH THUỐC MỚI
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>Dòng mới</Button>
            <Button variant="contained" size="small" color="primary" onClick={handleSave} disabled={medications.length === 0 || isSaving}>
              {isSaving ? 'Đang xử lý...' : 'Xác nhận cấp thuốc'}
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f7ff' }}>
                  <TableCell width="35%">Tên thuốc (Kho)</TableCell>
                  <TableCell width="10%">ĐVT</TableCell>
                  <TableCell align="center" width="12%">Lần/Ngày</TableCell>
                  <TableCell align="center" width="12%">SL/Lần</TableCell>
                  <TableCell>Cách dùng</TableCell>
                  <TableCell align="center" width="5%">Xóa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Autocomplete
                        options={danhMucThuoc}
                        getOptionLabel={(o) => o.ten_thuoc}
                        onChange={(_, v) => {
                          setMedications(medications.map(m => m.id === row.id ? {
                            ...m, thuoc_id: v?.id || '', ten_thuoc: v?.ten_thuoc || '',
                            don_vi: v?.don_vi || '', ghi_chu: v?.duong_dung || ''
                          } : m));
                        }}
                        renderInput={(p) => <TextField {...p} size="small" variant="standard" placeholder="Tìm thuốc..." />}
                      />
                    </TableCell>
                    <TableCell>{row.don_vi}</TableCell>
                    <TableCell>
                      <TextField type="number" size="small" value={row.so_lan_dung} 
                        onChange={(e) => setMedications(medications.map(m => m.id === row.id ? {...m, so_lan_dung: Number(e.target.value)} : m))} />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" size="small" value={row.so_luong_moi_lan} 
                        onChange={(e) => setMedications(medications.map(m => m.id === row.id ? {...m, so_luong_moi_lan: Number(e.target.value)} : m))} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.ghi_chu} 
                        onChange={(e) => setMedications(medications.map(m => m.id === row.id ? {...m, ghi_chu: e.target.value} : m))} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setMedications(medications.filter(m => m.id !== row.id))}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* KHU VỰC 2: LỊCH SỬ Y LỆNH (ĐÃ LƯU) */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'text.secondary' }}>
          <HistoryIcon fontSize="small" /> DANH SÁCH Y LỆNH TRONG TỜ ĐIỀU TRỊ
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Tên thuốc</TableCell>
                <TableCell align="center">Tổng SL</TableCell>
                <TableCell>ĐVT</TableCell>
                <TableCell>Cách dùng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Hủy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savedToa.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{item.thuoc?.ten_thuoc}</TableCell>
                  <TableCell align="center">{item.tong_so_luong}</TableCell>
                  <TableCell>{item.don_vi}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.ghi_chu}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: item.trang_thai === 'Chờ' ? '#ed6c02' : '#2e7d32', fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {item.trang_thai}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleDeleteSaved(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {savedToa.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Chưa có y lệnh thuốc nào được ghi nhận.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ToaThuocDoctor;
