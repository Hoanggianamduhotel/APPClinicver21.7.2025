import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  DataGrid, 
  GridColDef, 
  GridRowId 
} from "@mui/x-data-grid";
import { 
  Box, 
  TextField, 
  Button, 
  Autocomplete, 
  Typography, 
  IconButton, 
  Paper, 
  Grid,
  Card,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { supabase } from "@/lib/supabaseClient";

interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  gia_ban: number;
  so_luong_ton: number;
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

export default function ToaThuocDoctorMUI({ khambenhID }: { khambenhID: string }) {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const [ngayHenTaiKham, setNgayHenTaiKham] = useState<string>("");
  const idCounter = useRef(1);

  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([
    {
      id: 0,
      thuoc_id: "",
      ten_thuoc: "",
      don_vi: "",
      duong_dung: "",
      so_lan_dung: 1,
      so_luong_moi_lan: 1,
      tong_so_luong: 3,
      ghi_chu: "",
    },
  ]);

  // Logic tìm kiếm thuốc (giữ nguyên từ logic của bạn)
  const fetchThuoc = async (term: string) => {
    if (!term.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("thuoc")
        .select("*")
        .ilike("ten_thuoc", `%${term.trim()}%`)
        .limit(20);
      setThuocList(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRow = (id: number, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.id !== id) return row;
        let updatedRow = { ...row, [field]: value };

        if (field === "thuoc_id") {
          const selected = thuocList.find((t) => t.id === value);
          if (selected) {
            updatedRow.ten_thuoc = selected.ten_thuoc;
            updatedRow.don_vi = selected.don_vi;
            updatedRow.duong_dung = selected.duong_dung;
          }
        }

        // Tự động tính tổng số lượng
        const sld = field === "so_lan_dung" ? value : updatedRow.so_lan_dung;
        const slm = field === "so_luong_moi_lan" ? value : updatedRow.so_luong_moi_lan;
        updatedRow.tong_so_luong = soNgayToa * (Number(sld) || 0) * (Number(slm) || 0);

        return updatedRow;
      });

      // Tự động thêm dòng mới (Logic bạn yêu cầu)
      const lastRow = updatedRows[updatedRows.length - 1];
      if (lastRow.thuoc_id !== "" && updatedRows.every(r => r.thuoc_id !== "")) {
        updatedRows.push({
          id: idCounter.current++,
          thuoc_id: "",
          ten_thuoc: "",
          don_vi: "",
          duong_dung: "",
          so_lan_dung: 1,
          so_luong_moi_lan: 1,
          tong_so_luong: soNgayToa,
          ghi_chu: "",
        });
      }
      return updatedRows;
    });
  };

  const handleRemoveRow = (id: number) => {
    setToaThuocList((prev) => prev.filter((row) => row.id !== id));
  };

  // Cập nhật lại tất cả tổng số lượng khi số ngày toa thay đổi
  useEffect(() => {
    setToaThuocList(prev => prev.map(row => ({
      ...row,
      tong_so_luong: soNgayToa * row.so_lan_dung * row.so_luong_moi_lan
    })));
  }, [soNgayToa]);

  // Định nghĩa cột cho MUI DataGrid
  const columns: GridColDef[] = [
    {
      field: "ten_thuoc",
      headerName: "Tên thuốc",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Autocomplete
          fullWidth
          size="small"
          options={thuocList}
          getOptionLabel={(option) => option.ten_thuoc}
          loading={isLoading}
          onInputChange={(_, value) => fetchThuoc(value)}
          onChange={(_, value) => handleUpdateRow(params.row.id, "thuoc_id", value?.id || "")}
          renderInput={(inputParams) => (
            <TextField {...inputParams} variant="standard" placeholder="Tìm thuốc..." />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body1" fontWeight="bold">{option.ten_thuoc}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {option.duong_dung} | Tồn: {option.so_luong_ton} | Giá: {option.gia_ban.toLocaleString()}đ
                </Typography>
              </Box>
            </li>
          )}
        />
      ),
    },
    { field: "don_vi", headerName: "ĐVT", width: 80 },
    {
      field: "so_lan_dung",
      headerName: "Lần/Ngày",
      width: 100,
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          variant="standard"
          value={params.value}
          onChange={(e) => handleUpdateRow(params.row.id, "so_lan_dung", e.target.value)}
        />
      ),
    },
    {
      field: "so_luong_moi_lan",
      headerName: "SL/Lần",
      width: 100,
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          variant="standard"
          value={params.value}
          onChange={(e) => handleUpdateRow(params.row.id, "so_luong_moi_lan", e.target.value)}
        />
      ),
    },
    {
      field: "tong_so_luong",
      headerName: "Tổng SL",
      width: 90,
      renderCell: (params) => <Typography fontWeight="bold">{params.value}</Typography>
    },
    {
      field: "ghi_chu",
      headerName: "Ghi chú",
      flex: 0.8,
      renderCell: (params) => (
        <TextField
          fullWidth
          size="small"
          variant="standard"
          value={params.value}
          onChange={(e) => handleUpdateRow(params.row.id, "ghi_chu", e.target.value)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" size="small" onClick={() => handleRemoveRow(params.row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Số ngày kê toa"
            type="number"
            size="small"
            value={soNgayToa}
            onChange={(e) => setSoNgayToa(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Ngày hẹn tái khám"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={ngayHenTaiKham}
            onChange={(e) => setNgayHenTaiKham(e.target.value)}
          />
        </Grid>
      </Grid>

      <Box sx={{ height: 400, width: '100%', mb: 2 }}>
        <DataGrid
          rows={toaThuocList}
          columns={columns}
          rowHeight={60}
          hideFooter
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold'
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={() => setToaThuocList(prev => [...prev, { id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "", so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: "" }])}
        >
          Thêm dòng
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<SaveIcon />}
          onClick={() => {/* Logic save của bạn */}}
        >
          Lưu toa thuốc
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />}>
          In toa
        </Button>
      </Box>
    </Paper>
  );
}
