// ReceptionistView.tsx - Restored from original system
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { supabase } from "@/lib/supabase";

const drawerWidth = 240;

interface BenhNhan {
  ho_ten: string;
  ngay_sinh: string;
  dia_chi: string;
  so_dien_thoai: string;
  can_nang: string;
}

const ReceptionistView: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [benhNhan, setBenhNhan] = useState<BenhNhan>({
    ho_ten: "",
    ngay_sinh: "",
    dia_chi: "",
    so_dien_thoai: "",
    can_nang: "",
  });
  const [danhsachCho, setDanhsachCho] = useState<any[]>([]);

  const hoTenRef = useRef<HTMLInputElement>(null);
  const ngaySinhRef = useRef<HTMLInputElement>(null);
  const diaChiRef = useRef<HTMLInputElement>(null);
  const soDienThoaiRef = useRef<HTMLInputElement>(null);
  const canNangRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDanhSachCho();
  }, []);

  const fetchDanhSachCho = async () => {
    const { data, error } = await supabase
      .from("danhsachcho")
      .select(
        "benhnhan_id, ho_ten, ngay_sinh, dia_chi, so_dien_thoai, can_nang, thang_tuoi"
      );
    if (error) {
      console.error("Lỗi khi lấy danh sách chờ:", error.message);
      return;
    }
    setDanhsachCho(data || []);
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBenhNhan({ ...benhNhan, [e.target.name]: e.target.value });
  };

  const handleEnterKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      nextRef?.current ? nextRef.current.focus() : handleSubmit();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Hàm định dạng hiển thị tuổi theo tháng
  const hienThiTuoiTheoThang = (thangTuoi: number) => {
    // Nếu tháng tuổi > 48 tháng, đổi sang hiển thị tuổi
    if (thangTuoi > 48) {
      const tuoi = thangTuoi / 12;
      // Làm tròn xuống 0.5
      const tuoiLamTron = Math.floor(tuoi * 2) / 2;
      return `${tuoiLamTron} tuổi`;
    } else {
      return `${thangTuoi} tháng`;
    }
  };

  const handleSubmit = async () => {
    // Kiểm tra bệnh nhân đã tồn tại
    const { data: existingPatient, error: findError } = await supabase
      .from("benhnhan")
      .select(
        "id, ho_ten, ngay_sinh, dia_chi, so_dien_thoai, can_nang, thang_tuoi"
      )
      .eq("ho_ten", benhNhan.ho_ten)
      .eq("ngay_sinh", benhNhan.ngay_sinh);

    if (findError) {
      alert("Lỗi khi tìm bệnh nhân: " + findError.message);
      return;
    }

    let patientId: number;
    let thangTuoi: number;

    if (existingPatient && existingPatient.length > 0) {
      const patient = existingPatient[0];
      patientId = patient.id;
      thangTuoi = patient.thang_tuoi;

      // Kiểm tra danh sách chờ
      const { data: inQueue, error: qErr } = await supabase
        .from("danhsachcho")
        .select("benhnhan_id")
        .eq("benhnhan_id", patientId);
      if (qErr) {
        alert("Lỗi khi kiểm tra danh sách chờ: " + qErr.message);
        return;
      }
      if (inQueue && inQueue.length > 0) {
        alert("Bệnh nhân này đã có trong danh sách chờ.");
        return;
      }
    } else {
      // Thêm mới bệnh nhân
      const { data: newP, error: insErr } = await supabase
        .from("benhnhan")
        .insert([
          {
            ho_ten: benhNhan.ho_ten,
            ngay_sinh: benhNhan.ngay_sinh,
            dia_chi: benhNhan.dia_chi,
            so_dien_thoai: benhNhan.so_dien_thoai,
            can_nang: benhNhan.can_nang,
          },
        ])
        .select("id, thang_tuoi")
        .single();
      if (insErr || !newP) {
        alert("Lỗi khi lưu bệnh nhân: " + insErr?.message);
        return;
      }
      patientId = newP.id;
      thangTuoi = newP.thang_tuoi;
    }

    // Thêm vào danh sách chờ
    const { error: dsError } = await supabase.from("danhsachcho").insert([
      {
        benhnhan_id: patientId,
        ho_ten: benhNhan.ho_ten,
        ngay_sinh: benhNhan.ngay_sinh,
        dia_chi: benhNhan.dia_chi,
        so_dien_thoai: benhNhan.so_dien_thoai,
        can_nang: benhNhan.can_nang,
        thang_tuoi: thangTuoi,
      },
    ]);
    if (dsError) {
      alert("Lỗi khi thêm vào danh sách chờ: " + dsError.message);
      return;
    }

    // Làm mới và reset form
    fetchDanhSachCho();
    setBenhNhan({
      ho_ten: "",
      ngay_sinh: "",
      dia_chi: "",
      so_dien_thoai: "",
      can_nang: "",
    });
    setOpenDialog(false);
    alert("Đã thêm bệnh nhân vào danh sách chờ.");
  };

  const columns: GridColDef[] = [
    { field: "ho_ten", headerName: "Họ tên", flex: 1 },
    { field: "ngay_sinh", headerName: "Ngày sinh", flex: 1 },
    {
      field: "thang_tuoi_display",
      headerName: "Tuổi",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "can_nang",
      headerName: "Cân nặng (kg)",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    { field: "dia_chi", headerName: "Địa chỉ", flex: 1 },
    { field: "so_dien_thoai", headerName: "Số điện thoại", flex: 1 },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography variant="h6" noWrap>
              Quản lý Bệnh Nhi
            </Typography>
          </Box>
          <Button color="inherit" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <List>
            <ListItem button>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Bệnh nhân" />
            </ListItem>
          </List>
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <List>
            <ListItem button>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Bệnh nhân" />
            </ListItem>
          </List>
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Thêm bệnh nhân
        </Button>

        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={danhsachCho.map((patient) => ({
              id: patient.benhnhan_id,
              ho_ten: patient.ho_ten,
              ngay_sinh: patient.ngay_sinh,
              thang_tuoi: patient.thang_tuoi,
              thang_tuoi_display: hienThiTuoiTheoThang(patient.thang_tuoi),
              can_nang: patient.can_nang,
              dia_chi: patient.dia_chi,
              so_dien_thoai: patient.so_dien_thoai,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10, 25]}
          />
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Thêm Bệnh Nhân Mới</DialogTitle>
          <DialogContent>
            <TextField
              label="Họ tên"
              fullWidth
              margin="normal"
              name="ho_ten"
              value={benhNhan.ho_ten}
              onChange={handleChange}
              onKeyPress={(e) => handleEnterKey(e, ngaySinhRef)}
              inputRef={hoTenRef}
            />
            <TextField
              label="Ngày sinh"
              type="date"
              fullWidth
              margin="normal"
              name="ngay_sinh"
              value={benhNhan.ngay_sinh}
              onChange={handleChange}
              onKeyPress={(e) => handleEnterKey(e, diaChiRef)}
              inputRef={ngaySinhRef}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Địa chỉ"
              fullWidth
              margin="normal"
              name="dia_chi"
              value={benhNhan.dia_chi}
              onChange={handleChange}
              onKeyPress={(e) => handleEnterKey(e, soDienThoaiRef)}
              inputRef={diaChiRef}
            />
            <TextField
              label="Số điện thoại"
              fullWidth
              margin="normal"
              name="so_dien_thoai"
              value={benhNhan.so_dien_thoai}
              onChange={handleChange}
              onKeyPress={(e) => handleEnterKey(e, canNangRef)}
              inputRef={soDienThoaiRef}
            />
            <TextField
              label="Cân nặng (kg)"
              fullWidth
              margin="normal"
              name="can_nang"
              value={benhNhan.can_nang}
              onChange={handleChange}
              onKeyPress={(e) => handleEnterKey(e)}
              inputRef={canNangRef}
              type="number"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button onClick={handleSubmit}>Lưu</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ReceptionistView;