import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  gia_ban: number;
}

interface ToaThuocRow {
  id: string;
  thuoc_id: string;
  ten_thuoc: string;
  so_lan_dung: string;
  so_luong_moi_lan: string;
  tong_so_luong: number;
  don_vi: string;
  ghi_chu: string;
  gia_ban: number;
  thanh_tien: number;
  isSaved?: boolean;
}

const GhiChuInput: React.FC<{ 
  value: string; 
  onUpdate: (v: string) => void; 
  placeholder?: string 
}> = ({ value, onUpdate, placeholder }) => (
  <TextField
    fullWidth
    variant="standard"
    size="small"
    value={value || ""}
    placeholder={placeholder}
    onChange={(e) => onUpdate(e.target.value)}
    InputProps={{ disableUnderline: true }}
    sx={{ "& input": { fontSize: "0.9rem" } }}
  />
);

export const ToaThuocDoctor: React.FC<{ 
  khambenhID: string; 
  onFinish?: () => void; 
  onPrint?: () => void 
}> = ({ khambenhID, onFinish, onPrint }) => {
  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([]);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [soNgayToa, setSoNgayToa] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Tính tổng tiền toa thuốc
  const tongToa = toaThuocList.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);

  const fetchThuoc = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) return;
    const { data } = await supabase
      .from("thuoc")
      .select("id, ten_thuoc, don_vi, gia_ban")
      .ilike("ten_thuoc", `%${searchTerm}%`)
      .limit(10);
    if (data) setThuocList(data);
  };

  const handleAddRow = () => {
    const newRow: ToaThuocRow = {
      id: Math.random().toString(36).substr(2, 9),
      thuoc_id: "",
      ten_thuoc: "",
      so_lan_dung: "2",
      so_luong_moi_lan: "1",
      tong_so_luong: 0,
      don_vi: "",
      ghi_chu: "",
      gia_ban: 0,
      thanh_tien: 0,
    };
    setToaThuocList([...toaThuocList, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setToaThuocList(toaThuocList.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          
          // Nếu chọn thuốc, cập nhật đơn vị và giá
          if (field === "thuoc_id") {
            const selectedThuoc = thuocList.find((t) => t.id === value);
            if (selectedThuoc) {
              updatedRow.ten_thuoc = selectedThuoc.ten_thuoc;
              updatedRow.don_vi = selectedThuoc.don_vi;
              updatedRow.gia_ban = selectedThuoc.gia_ban;
            }
          }

          // Tự động tính tổng số lượng và thành tiền
          const lan = parseFloat(updatedRow.so_lan_dung) || 0;
          const sl = parseFloat(updatedRow.so_luong_moi_lan) || 0;
          updatedRow.tong_so_luong = lan * sl * soNgayToa;
          updatedRow.thanh_tien = updatedRow.tong_so_luong * updatedRow.gia_ban;
          
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleSave = async () => {
    if (toaThuocList.length === 0) return alert("Chưa có thuốc trong toa!");
    setIsLoading(true);
    try {
      const dataToInsert = toaThuocList
        .filter(r => r.thuoc_id)
        .map((r) => ({
          khambenh_id: khambenhID,
          thuoc_id: r.thuoc_id,
          so_luong: r.tong_so_luong,
          lieu_dung: r.ghi_chu || `${r.so_lan_dung} lần/ngày, mỗi lần ${r.so_luong_moi_lan} ${r.don_vi}`,
          don_gia: r.gia_ban,
          thanh_tien: r.thanh_tien
        }));

      const { error } = await supabase.from("toathuoc").insert(dataToInsert);
      if (error) throw error;
      
      alert("Đã lưu toa thuốc thành công!");
      if (onFinish) onFinish();
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "ten_thuoc", 
      headerName: "Tên thuốc", 
      flex: 2, 
      headerAlign: 'center',
      renderCell: (p) => (
        <Autocomplete 
          size="small" fullWidth options={thuocList}
          getOptionLabel={(o) => o.ten_thuoc || ""}
          value={thuocList.find(t => t.id === p.row.thuoc_id) || (p.row.isSaved ? { ten_thuoc: p.row.ten_thuoc } : null) as any}
          onChange={(_, v) => handleUpdateRow(p.row.id, "thuoc_id", v?.id || "")}
          onInputChange={(_, v) => fetchThuoc(v)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              variant="standard" 
              placeholder="Nhập tên thuốc..." 
              InputProps={{ ...params.InputProps, disableUnderline: true }}
              sx={{ '& input': { fontSize: '0.9rem', fontWeight: 500, color: '#1976d2' } }}
            />
          )}
        />
      )
    },
    { 
      field: "so_lan_dung", 
      headerName: "Lần dùng", 
      width: 80, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (p) => <GhiChuInput value={p.row.so_lan_dung} onUpdate={(v) => handleUpdateRow(p.row.id, "so_lan_dung", v)} /> 
    },
    { 
      field: "so_luong_moi_lan", 
      headerName: "SL/lần", 
      width: 80, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (p) => <GhiChuInput value={p.row.so_luong_moi_lan} onUpdate={(v) => handleUpdateRow(p.row.id, "so_luong_moi_lan", v)} /> 
    },
    { 
      field: "tong_so_luong", 
      headerName: "Tổng SL", 
      width: 90, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (p) => (
        <Typography sx={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '0.9rem' }}>
          {p.row.tong_so_luong} {p.row.don_vi}
        </Typography>
      )
    },
    { 
      field: "ghi_chu", 
      headerName: "Cách dùng / Ghi chú", 
      flex: 1.5, 
      renderCell: (p) => (
        <GhiChuInput 
          value={p.row.ghi_chu} 
          placeholder="Sáng 1, chiều 1..." 
          onUpdate={(v) => handleUpdateRow(p.row.id, "ghi_chu", v)} 
        />
      ) 
    },
    { 
      field: "actions", 
      headerName: "", 
      width: 50, 
      renderCell: (p) => (
        <IconButton size="small" onClick={() => handleDeleteRow(p.row.id)}>
          <DeleteIcon fontSize="small" sx={{ color: '#ccc', '&:hover': { color: 'red' } }} />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header điều khiển */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: '#fff9c4', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Typography variant="body2" sx={{ fontWeight: 600 }}>Số ngày thuốc:</Typography>
           <TextField 
             type="number" size="small" 
             value={soNgayToa} 
             onChange={(e) => setSoNgayToa(Number(e.target.value))} 
             sx={{ width: 60, bgcolor: 'white', '& input': { p: '4px 8px', textAlign: 'center' } }} 
           />
           <Button startIcon={<AddIcon />} size="small" onClick={handleAddRow} sx={{ ml: 2 }}>Thêm thuốc</Button>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
          TỔNG CỘNG: {tongToa.toLocaleString()} đ
        </Typography>
      </Box>

      {/* Bảng thuốc */}
      <Box sx={{ minHeight: 200, bgcolor: 'white' }}>
        <DataGrid 
          autoHeight 
          rows={toaThuocList} 
          columns={columns} 
          hideFooter 
          rowHeight={50}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f5f5f5',
              color: '#555',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              minHeight: '40px !important'
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #eee',
              '&:focus': { outline: 'none' }
            }
          }}
        />
      </Box>

      {/* Nút hành động */}
      <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<SaveIcon />} 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu Toa Thuốc"}
        </Button>
      </Box>
    </Box>
  );
};
