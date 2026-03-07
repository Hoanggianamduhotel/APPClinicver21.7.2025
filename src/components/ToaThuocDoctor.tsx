import React, { useEffect, useState, useRef, useCallback } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField, Button, Autocomplete, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "@/lib/supabase"; 

export interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_luong_ton: number;
  gia_ban: number; // Thêm giá bán
}

interface ToaThuocRow {
  id: number | string;
  thuoc_id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_lan_dung: string; // Đổi sang string để nhập linh hoạt
  so_luong_moi_lan: string; // Hỗ trợ 0.5, 1/2
  tong_so_luong: string; // Cho phép sửa thủ công
  gia_ban: number;
  thanh_tien: number;
  ghi_chu: string;
  isSaved?: boolean;
}

// Hàm hỗ trợ chuyển đổi phân số hoặc chuỗi sang số thập phân
const parseQuantity = (input: string): number => {
  if (!input) return 0;
  if (input.includes('/')) {
    const [num, den] = input.split('/').map(Number);
    return den ? num / den : num;
  }
  return parseFloat(input) || 0;
};

const GhiChuInput = ({ value, onUpdate, placeholder = "..." }: { value: string; onUpdate: (val: string) => void; placeholder?: string }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);
  return (
    <TextField
      size="small" fullWidth variant="standard" value={localValue} placeholder={placeholder}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onUpdate(localValue)}
      onKeyDown={(e) => { if (e.key === " ") e.stopPropagation(); }}
      sx={{ '& .MuiInput-root': { fontSize: '0.875rem' } }}
    />
  );
};

export const ToaThuocDoctor: React.FC<{ khambenhID: string; onFinish?: () => void; onPrint?: () => void }> = ({ 
  khambenhID, onFinish, onPrint 
}) => {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const idCounter = useRef(Date.now());

  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([{
    id: 'init', thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
    so_lan_dung: "2", so_luong_moi_lan: "1", tong_so_luong: "6", gia_ban: 0, thanh_tien: 0, ghi_chu: ""
  }]);

  const fetchSavedToaThuoc = useCallback(async () => {
    if (!khambenhID) return;
    const { data, error } = await supabase
      .from("toathuoc")
      .select(`*, thuoc(ten_thuoc, don_vi, duong_dung, gia_ban)`)
      .eq("khambenh_id", khambenhID);

    if (data && data.length > 0) {
      const savedRows: ToaThuocRow[] = data.map((item: any) => ({
        id: item.id,
        thuoc_id: item.thuoc_id,
        ten_thuoc: item.thuoc?.ten_thuoc || "",
        don_vi: item.thuoc?.don_vi || "",
        duong_dung: item.thuoc?.duong_dung || "",
        so_lan_dung: String(item.so_lan_dung),
        so_luong_moi_lan: String(item.so_luong_moi_lan),
        tong_so_luong: String(item.tong_so_lu_ong || item.tong_so_luong),
        gia_ban: item.thuoc?.gia_ban || 0,
        thanh_tien: (item.tong_so_luong || 0) * (item.thuoc?.gia_ban || 0),
        ghi_chu: item.ghi_chu,
        isSaved: true
      }));
      setToaThuocList([...savedRows, createEmptyRow()]);
    }
  }, [khambenhID]);

  const createEmptyRow = () => ({
    id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
    so_lan_dung: "2", so_luong_moi_lan: "1", tong_so_luong: String(2 * 1 * soNgayToa), 
    gia_ban: 0, thanh_tien: 0, ghi_chu: ""
  });

  useEffect(() => { fetchSavedToaThuoc(); }, [fetchSavedToaThuoc]);

  const fetchThuoc = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    const { data } = await supabase.from("thuoc")
      .select("id, ten_thuoc, don_vi, duong_dung, so_luong_ton, gia_ban")
      .ilike("ten_thuoc", `%${term}%`).limit(20);
    setThuocList(data || []);
    setLoading(false);
  };

  const handleUpdateRow = (id: number | string, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList(prev => {
      let rows = [...prev];
      const idx = rows.findIndex(r => r.id === id);
      if (idx === -1) return prev;

      let row = { ...rows[idx], [field]: value };

      if (field === "thuoc_id") {
        const t = thuocList.find(i => i.id === value);
        row.ten_thuoc = t?.ten_thuoc || "";
        row.don_vi = t?.don_vi || "";
        row.duong_dung = t?.duong_dung || "";
        row.gia_ban = t?.gia_ban || 0;
      }

      // Tự động tính toán nếu thay đổi các thông số đầu vào
      if (field === "so_lan_dung" || field === "so_luong_moi_lan" || field === "thuoc_id") {
        const tong = parseQuantity(String(row.so_lan_dung)) * parseQuantity(String(row.so_luong_moi_lan)) * soNgayToa;
        row.tong_so_luong = String(tong);
      }

      // Luôn tính thành tiền dựa trên tổng số lượng
      row.thanh_tien = parseQuantity(String(row.tong_so_luong)) * row.gia_ban;
      rows[idx] = row;

      if (idx === rows.length - 1 && row.thuoc_id !== "") {
        rows.push(createEmptyRow());
      }
      return rows;
    });
  };

  const columns: GridColDef[] = [
    { field: "ten_thuoc", headerName: "Tên thuốc", flex: 2, renderCell: (p) => (
      <Autocomplete 
        size="small" fullWidth options={thuocList}
        getOptionLabel={(o) => o.ten_thuoc || ""}
        value={thuocList.find(t => t.id === p.row.thuoc_id) || (p.row.isSaved ? { ten_thuoc: p.row.ten_thuoc } : null) as any}
        onChange={(_, v) => handleUpdateRow(p.row.id, "thuoc_id", v?.id || "")}
        onInputChange={(_, v) => fetchThuoc(v)}
        renderInput={(params) => <TextField {...params} variant="standard" placeholder="Tìm..." />}
      />
    )},
    { field: "don_vi", headerName: "ĐVT", width: 60, renderCell: (p) => <Typography variant="body2">{p.row.don_vi}</Typography> },
    { field: "so_lan_dung", headerName: "Lần/N", width: 60, renderCell: (p) => (
      <GhiChuInput value={p.row.so_lan_dung} onUpdate={(v) => handleUpdateRow(p.row.id, "so_lan_dung", v)} />
    )},
    { field: "so_luong_moi_lan", headerName: "SL/L", width: 60, renderCell: (p) => (
      <GhiChuInput value={p.row.so_luong_moi_lan} onUpdate={(v) => handleUpdateRow(p.row.id, "so_luong_moi_lan", v)} />
    )},
    { field: "tong_so_luong", headerName: "Tổng SL", width: 70, renderCell: (p) => (
      <GhiChuInput value={p.row.tong_so_luong} onUpdate={(v) => handleUpdateRow(p.row.id, "tong_so_luong", v)} />
    )},
    { field: "gia_ban", headerName: "Đơn giá", width: 80, renderCell: (p) => <Typography variant="body2">{p.row.gia_ban.toLocaleString()}</Typography> },
    { field: "thanh_tien", headerName: "Thành tiền", width: 90, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{p.row.thanh_tien.toLocaleString()}</Typography> },
    { field: "actions", headerName: "", width: 40, renderCell: (p) => (
      <IconButton size="small" color="error" onClick={() => handleDeleteRow(p.row.id)}><DeleteIcon fontSize="inherit" /></IconButton>
    )}
  ];

  const handleDeleteRow = async (id: number | string) => {
    const row = toaThuocList.find(r => r.id === id);
    if (row?.isSaved) {
        if (!confirm("Xóa thuốc khỏi toa?")) return;
        await supabase.from("toathuoc").delete().eq("id", id);
    }
    setToaThuocList(prev => prev.filter(r => r.id !== id));
  };

  const tongToa = toaThuocList.reduce((acc, row) => acc + (row.thanh_tien || 0), 0);

  const handleSave = async () => {
    const data = toaThuocList.filter(r => r.thuoc_id && !r.isSaved).map(r => ({
      khambenh_id: khambenhID,
      thuoc_id: r.thuoc_id,
      so_lan_dung: parseQuantity(r.so_lan_dung),
      so_luong_moi_lan: parseQuantity(r.so_luong_moi_lan),
      tong_so_luong: parseQuantity(r.tong_so_luong),
      ghi_chu: r.ghi_chu
    }));
    if (data.length === 0) return alert("Không có thuốc mới");
    const { error } = await supabase.from("toathuoc").insert(data);
    if (!error) { alert("Đã lưu!"); fetchSavedToaThuoc(); }
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <TextField label="Ngày toa" type="number" size="small" value={soNgayToa} onChange={(e) => setSoNgayToa(Number(e.target.value))} sx={{ width: 80 }} />
        <Typography variant="h6" color="primary">Tổng toa: {tongToa.toLocaleString()} đ</Typography>
      </Box>
      <DataGrid autoHeight rows={toaThuocList} columns={columns} hideFooter rowHeight={45} disableRowSelectionOnClick />
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button variant="contained" color="success" onClick={handleSave}>Lưu toa</Button>
        <Button variant="outlined" onClick={onPrint}>In toa</Button>
      </Box>
    </Box>
  );
};
