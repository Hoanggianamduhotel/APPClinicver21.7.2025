// ... Giữ các phần import và interface như cũ ...

export const ToaThuocDoctor: React.FC<{ khambenhID: string; onFinish?: () => void; onPrint?: () => void }> = ({ 
  khambenhID, onFinish, onPrint 
}) => {
  // ... Giữ các state và logic fetch dữ liệu như cũ ...

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
      width: 80, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (p) => (
        <Typography sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: '#fff9c4', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Typography variant="body2" sx={{ fontWeight: 600 }}>Số ngày thuốc:</Typography>
           <TextField 
             type="number" size="small" 
             value={soNgayToa} 
             onChange={(e) => setSoNgayToa(Number(e.target.value))} 
             sx={{ width: 60, bgcolor: 'white' }} 
           />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
          TỔNG CỘNG: {tongToa.toLocaleString()} đ
        </Typography>
      </Box>

      {/* Bảng thuốc */}
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
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            minHeight: '40px !important'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #eee',
            '&:focus': { outline: 'none' }
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: '#fcfcfc'
          }
        }}
      />

      {/* Nút hành động (Nếu bạn đã có ở DoctorView thì có thể ẩn ở đây) */}
      <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="contained" color="success" startIcon={<i className="fas fa-save" />} onClick={handleSave}>
          Lưu Toa Thuốc
        </Button>
      </Box>
    </Box>
  );
};
