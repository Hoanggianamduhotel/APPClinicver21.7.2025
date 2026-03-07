import React, { useEffect, useState, useRef, useCallback } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField, Button, Autocomplete, CircularProgress, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "@/lib/supabase"; 

export interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_luong_ton: number;
}

interface ToaThuocRow {
  id: number | string;
  thuoc_id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  tong_so_luong: number;
  ghi_chu: string;
  isSaved?: boolean;
}

// --- COMPONENT GHI CHÚ (FIX LỖI TELEX & SPACE) ---
const GhiChuInput = ({ value, onUpdate }: { value: string; onUpdate: (val: string) => void }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);

  return (
    <TextField
      size="small"
      fullWidth
      variant="standard"
      value={localValue}
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
    so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: 3, ghi_chu: ""
  }]);

  // Load toa thuốc cũ từ Database
  const fetchSavedToaThuoc = useCallback(async () => {
    if (!khambenhID) return;
    const { data, error } = await supabase
      .from("toathuoc")
      .select(`*, thuoc(ten_thuoc, don_vi, duong_dung)`)
      .eq("khambenh_id", khambenhID);

    if (error) console.error("Lỗi load toa:", error);
    if (data && data.length > 0) {
      const savedRows: ToaThuocRow[] = data.map((item: any) => ({
        id: item.id,
        thuoc_id: item.thuoc_id,
        ten_thuoc: item.thuoc?.ten_thuoc || "",
        don_vi: item.thuoc?.don_vi || "",
        duong_dung: item.thuoc?.duong_dung || "",
        so_lan_dung: item.so_lan_dung,
        so_luong_moi_lan: item.so_luong_moi_lan,
        tong_so_luong: item.tong_so_luong,
        ghi_chu: item.ghi_chu,
        isSaved: true
      }));
      
      setToaThuocList([...savedRows, {
        id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
        so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: ""
      }]);
    }
  }, [khambenhID, soNgayToa]);

  useEffect(() => { fetchSavedToaThuoc(); }, [fetchSavedToaThuoc]);

  const fetchThuoc = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    const { data } = await supabase.from("thuoc")
      .select("id, ten_thuoc, don_vi, duong_dung, so_luong_ton")
      .ilike("ten_thuoc", `%${term}%`).limit(20);
    
    setThuocList(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newItems = (data || []).filter(t => !existingIds.has(t.id));
      return [...prev, ...newItems];
    });
    setLoading(false);
  };

  const handleUpdateRow = useCallback((id: number | string, field: keyof ToaThuocRow, value: any) => {
    setToaThuocList(prev => {
      let rows = [...prev];
      const index = rows.findIndex(r => r.id === id);
      if (index === -1) return prev;

      let newRow = { ...rows[index], [field]: value };

      if (field === "thuoc_id") {
        const selected = thuocList.find(t => t.id === value);
        newRow = { 
          ...newRow, 
          ten_thuoc: selected?.ten_thuoc || "", 
          don_vi: selected?.don_vi || "", 
          duong_dung: selected?.duong_dung || "" 
        };
      }
      
      newRow.tong_so_luong = (Number(newRow.so_lan_dung) || 0) * (Number(newRow.so_luong_moi_lan) || 0) * soNgayToa;
      rows[index] = newRow;

      if (index === rows.length - 1 && newRow.thuoc_id !== "") {
        rows.push({
          id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "",
          so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: ""
        });
      }
      return rows;
    });
  }, [thuocList, soNgayToa]);

  const handleDeleteRow = async (id: number | string) => {
    const rowToDelete = toaThuocList.find(r => r.id === id);
    if (rowToDelete?.isSaved) {
      if (!window.confirm("Xóa thuốc này khỏi toa đã lưu?")) return;
      await supabase.from("toathuoc").delete().eq("id", id);
    }
    setToaThuocList(prev => prev.filter(r => r.id !== id));
  };

  const columns: GridColDef[] = [
    { field: "ten_thuoc", headerName: "Tên thuốc", flex: 2, renderCell: (p) => {
        const selectedThuoc = thuocList.find(t => t.id === p.row.thuoc_id);
        const savedValue = p.row.isSaved ? ({ 
          id: p.row.thuoc_id, ten_thuoc: p.row.ten_thuoc, don_vi: p.row.don_vi, 
          duong_dung: p.row.duong_dung, so_luong_ton: 0 
        } as Thuoc) : null;

        return (
          <Autocomplete 
            size="small" fullWidth options={thuocList} loading={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(o) => o.ten_thuoc || ""}
            value={selectedThuoc || savedValue}
            onChange={(_, v) => handleUpdateRow(p.row.id, "thuoc_id", v?.id || "")}
            onInputChange={(_, v) => fetchThuoc(v)}
            renderInput={(params) => <TextField {...params} variant="standard" placeholder="Tìm thuốc..." />}
          />
        );
    }},
    { field: "so_lan_dung", headerName: "Lần/N", width: 60, renderCell: (p) => (
      <TextField type="number" size="small" variant="standard" value={p.row.so_lan_dung} onChange={(e) => handleUpdateRow(p.row.id, "so_lan_dung", e.target.value)} />
    )},
    { field: "so_luong_moi_lan", headerName: "SL/L", width: 60, renderCell: (p) => (
      <TextField type="number" size="small" variant="standard" value={p.row.so_luong_moi_lan} onChange={(e) => handleUpdateRow(p.row.id, "so_luong_moi_lan", e.target.value)} />
    )},
    { field: "tong_so_luong", headerName: "Tổng", width: 60, renderCell: (p) => (
      <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{p.row.tong_so_luong}</Typography>
    )},
    { field: "ghi_chu", headerName: "Ghi chú", flex: 1.2, renderCell: (p) => (
      <GhiChuInput value={p.row.ghi_chu} onUpdate={(val) => handleUpdateRow(p.row.id, "ghi_chu", val)} />
    )},
    { field: "actions", headerName: "", width: 50, sortable: false, renderCell: (p) => (
      <IconButton size="small" color="error" onClick={() => handleDeleteRow(p.row.id)}><DeleteIcon fontSize="inherit" /></IconButton>
    )}
  ];

  const handleSave = async () => {
    const dataToInsert = toaThuocList
      .filter(row => row.thuoc_id !== "" && !row.isSaved)
      .map(row => ({
        khambenh_id: khambenhID, thuoc_id: row.thuoc_id,
        so_lan_dung: row.so_lan_dung, so_luong_moi_lan: row.so_luong_moi_lan,
        tong_so_luong: row.tong_so_luong, ghi_chu: row.ghi_chu
      }));

    if (dataToInsert.length === 0) return alert("Không có thuốc mới để thêm");
    const { error } = await supabase.from("toathuoc").insert(dataToInsert);
    if (error) alert("Lỗi: " + error.message);
    else {
      alert("Đã lưu toa thuốc!");
      fetchSavedToaThuoc();
      if (onFinish) onFinish();
    }
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <TextField label="Số ngày" type="number" size="small" value={soNgayToa} onChange={(e) => setSoNgayToa(Number(e.target.value))} sx={{ width: 80 }} />
      </Box>
      <DataGrid 
        autoHeight rows={toaThuocList} columns={columns} hideFooter rowHeight={45}
        sx={{ border: 'none', '& .MuiDataGrid-columnHeader': { backgroundColor: '#fafafa' } }}
      />
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button variant="contained" color="success" size="small" onClick={handleSave}>Lưu toa</Button>
        <Button variant="outlined" size="small" onClick={onPrint}>In toa</Button>
      </Box>
    </Box>
  );
};
