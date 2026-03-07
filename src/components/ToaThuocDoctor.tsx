import React, { useEffect, useState, useRef } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField, Button, Autocomplete, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase"; 

export interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_luong_ton: number;
}

interface Props {
  khambenhID: string;
  onFinish?: () => void;
  onPrint?: () => void;
}

interface ToaThuocRow {
  id: number;
  thuoc_id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  tong_so_luong: number;
  ghi_chu: string;
}

export const ToaThuocDoctor: React.FC<Props> = ({ khambenhID, onFinish, onPrint }) => {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const idCounter = useRef(1);

  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([{
    id: 0, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
    so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: 3, ghi_chu: ""
  }]);

  // Tự động tính lại tổng số lượng khi số ngày kê toa thay đổi
  useEffect(() => {
    setToaThuocList(prev => prev.map(row => ({
      ...row,
      tong_so_luong: (row.so_lan_dung || 0) * (row.so_luong_moi_lan || 0) * soNgayToa
    })));
  }, [soNgayToa]);

  const fetchThuoc = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    const { data } = await supabase.from("thuoc")
      .select("id, ten_thuoc, don_vi, duong_dung, so_luong_ton")
      .ilike("ten_thuoc", `%${term}%`).limit(20);
    
    // FIX 1: Gộp kết quả search mới vào list cũ để các dòng đã chọn không bị mất label hiển thị
    setThuocList(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newItems = (data || []).filter(t => !existingIds.has(t.id));
      return [...prev, ...newItems];
    });
    setLoading(false);
  };

  const handleUpdateRow = (id: number, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList(prev => {
      let rows = prev.map(row => {
        if (row.id !== id) return row;
        let newRow = { ...row, [field]: value };
        
        // Nếu cập nhật thuốc, tự động điền các thông tin liên quan
        if (field === "thuoc_id") {
          const selected = thuocList.find(t => t.id === value);
          newRow = { 
            ...newRow, 
            ten_thuoc: selected?.ten_thuoc || "", 
            don_vi: selected?.don_vi || "", 
            duong_dung: selected?.duong_dung || "" 
          };
        }
        
        // Tính lại tổng số lượng của dòng đang sửa
        newRow.tong_so_luong = (newRow.so_lan_dung || 0) * (newRow.so_luong_moi_lan || 0) * soNgayToa;
        return newRow;
      });

      // FIX: Tự động thêm dòng mới khi dòng cuối cùng đã được chọn thuốc
      const lastRow = rows[rows.length - 1];
      if (lastRow.thuoc_id !== "") {
        rows.push({
          id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
          so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: ""
        });
      }
      return [...rows];
    });
  };

  const handleSave = async () => {
    const dataToInsert = toaThuocList
      .filter(row => row.thuoc_id !== "")
      .map(row => ({
        khambenh_id: khambenhID,
        thuoc_id: row.thuoc_id,
        so_lan_dung: row.so_lan_dung,
        so_luong_moi_lan: row.so_luong_moi_lan,
        tong_so_luong: row.tong_so_luong,
        ghi_chu: row.ghi_chu
      }));

    if (dataToInsert.length === 0) return alert("Chưa có thuốc để lưu");
    const { error } = await supabase.from("toathuoc").insert(dataToInsert);
    if (error) alert("Lỗi: " + error.message);
    else {
      alert("Đã lưu thành công!");
      if (onFinish) onFinish();
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "ten_thuoc", 
      headerName: "Tên thuốc", 
      flex: 2, 
      renderCell: (p) => (
        <Autocomplete 
          size="small" 
          fullWidth 
          options={thuocList} 
          loading={loading}
          // Quan trọng để đồng bộ ID
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(o) => o.ten_thuoc || ""}
          value={thuocList.find(t => t.id === p.row.thuoc_id) || null}
          onChange={(_, v) => handleUpdateRow(p.row.id, "thuoc_id", v?.id || "")}
          onInputChange={(_, v) => fetchThuoc(v)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              variant="standard" 
              placeholder="Tìm thuốc..." 
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )
    },
    { 
      field: "so_lan_dung", 
      headerName: "Lần/N", 
      width: 70, 
      renderCell: (p) => (
        <TextField 
          type="number" 
          size="small" 
          variant="standard"
          value={p.row.so_lan_dung} 
          onChange={(e) => handleUpdateRow(p.row.id, "so_lan_dung", +e.target.value)} 
        />
      )
    },
    { 
      field: "so_luong_moi_lan", 
      headerName: "SL/L", 
      width: 70, 
      renderCell: (p) => (
        <TextField 
          type="number" 
          size="small" 
          variant="standard"
          value={p.row.so_luong_moi_lan} 
          onChange={(e) => handleUpdateRow(p.row.id, "so_luong_moi_lan", +e.target.value)} 
        />
      )
    },
    { 
      field: "tong_so_luong", 
      headerName: "Tổng", 
      width: 70,
      renderCell: (p) => <span style={{ paddingLeft: '8px' }}>{p.row.tong_so_luong}</span>
    },
    { 
      field: "ghi_chu", 
      headerName: "Ghi chú", 
      flex: 1.5, 
      renderCell: (p) => (
        <TextField 
          size="small" 
          fullWidth 
          variant="standard"
          placeholder="..."
          value={p.row.ghi_chu} 
          onChange={(e) => handleUpdateRow(p.row.id, "ghi_chu", e.target.value)} 
          sx={{ '& .MuiInput-root': { fontSize: '0.875rem' } }}
        />
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <TextField 
          label="Số ngày kê toa" 
          type="number" 
          size="small"
          value={soNgayToa} 
          onChange={(e) => setSoNgayToa(+e.target.value)} 
          sx={{ width: 150 }} 
        />
      </Box>

      <DataGrid 
        autoHeight 
        rows={toaThuocList} 
        columns={columns} 
        hideFooter 
        rowHeight={50} // Tăng chiều cao dòng để input không bị đè font
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#f5f5f5',
          }
        }}
      />

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" color="success" onClick={handleSave}>
          Lưu toa thuốc
        </Button>
        <Button variant="outlined" color="primary" onClick={onPrint}>
          In toa
        </Button>
      </Box>
    </Box>
  );
};
