import React, { useEffect, useState, useRef, useCallback } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, TextField, Button, Typography, CircularProgress, Autocomplete } from "@mui/material";
import { supabase } from "./supabaseClient";
import { Thuoc } from "./utils/thuocHelper";

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
  ton_kho: number; // Thêm để validate
}

export const ToaThuocDoctorDataGrid: React.FC<Props> = ({ khambenhID, onFinish, onPrint }) => {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const idCounter = useRef(1);

  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([{
    id: 0, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
    so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: 1, ghi_chu: "", ton_kho: 0
  }]);

  // Cập nhật lại tổng số lượng khi thay đổi số ngày
  useEffect(() => {
    setToaThuocList(prev => prev.map(row => ({
      ...row,
      tong_so_luong: row.so_lan_dung * row.so_luong_moi_lan * soNgayToa
    })));
  }, [soNgayToa]);

  const fetchThuoc = async (term: string) => {
    if (!term.trim()) return setThuocList([]);
    setLoading(true);
    const { data } = await supabase.from("thuoc")
      .select("id, ten_thuoc, don_vi, duong_dung, gia_ban, so_luong_ton")
      .ilike("ten_thuoc", `%${term}%`).limit(20);
    setThuocList(data || []);
    setLoading(false);
  };

  const handleUpdateRow = (id: number, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList(prev => {
      const rows = prev.map(row => {
        if (row.id !== id) return row;
        let newRow = { ...row, [field]: value };
        
        if (field === "thuoc_id") {
          const selected = thuocList.find(t => t.id === value);
          newRow = { 
            ...newRow, 
            ten_thuoc: selected?.ten_thuoc || "", 
            don_vi: selected?.don_vi || "", 
            duong_dung: selected?.duong_dung || "",
            ton_kho: selected?.so_luong_ton || 0
          };
        }
        newRow.tong_so_luong = newRow.so_lan_dung * newRow.so_luong_moi_lan * soNgayToa;
        return newRow;
      });

      // Tự động thêm dòng mới nếu dòng cuối đã chọn thuốc
      if (rows[rows.length - 1].thuoc_id !== "") {
        rows.push({
          id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
          so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: "", ton_kho: 0
        });
      }
      return rows;
    });
  };

  const columns: GridColDef[] = [
    { field: "ten_thuoc", headerName: "Tên thuốc", flex: 1.5, renderCell: (params) => (
      <Autocomplete size="small" fullWidth options={thuocList} loading={loading}
        getOptionLabel={(o) => o.ten_thuoc}
        value={thuocList.find(t => t.id === params.row.thuoc_id) || null}
        onChange={(_, v) => handleUpdateRow(params.row.id, "thuoc_id", v?.id || "")}
        onInputChange={(_, v) => fetchThuoc(v)}
        renderInput={(p) => <TextField {...p} placeholder="Tìm thuốc..." />}
      />
    )},
    { field: "so_lan_dung", headerName: "Lần/N", width: 80, renderCell: (p) => (
      <TextField type="number" size="small" value={p.row.so_lan_dung} onChange={(e) => handleUpdateRow(p.row.id, "so_lan_dung", +e.target.value)} />
    )},
    { field: "so_luong_moi_lan", headerName: "SL/L", width: 80, renderCell: (p) => (
      <TextField type="number" size="small" value={p.row.so_luong_moi_lan} onChange={(e) => handleUpdateRow(p.row.id, "so_luong_moi_lan", +e.target.value)} />
    )},
    { field: "tong_so_luong", headerName: "Tổng", width: 80 },
    { field: "ghi_chu", headerName: "Ghi chú", flex: 1, renderCell: (p) => (
      <TextField size="small" fullWidth value={p.row.ghi_chu} onChange={(e) => handleUpdateRow(p.row.id, "ghi_chu", e.target.value)} />
    )}
  ];

  return (
    <Box>
      <TextField label="Số ngày kê toa" type="number" value={soNgayToa} onChange={(e) => setSoNgayToa(+e.target.value)} sx={{ mb: 2, width: 150 }} />
      <DataGrid autoHeight rows={toaThuocList} columns={columns} hideFooter />
      <Button variant="contained" color="success" onClick={/* logic save here */} sx={{ mt: 2 }}>Lưu toa thuốc</Button>
    </Box>
  );
};
