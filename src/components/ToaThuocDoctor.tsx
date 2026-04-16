import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; [cite: 38, 39, 40, 41, 42]
import { Trash2, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; [cite: 42, 43]

interface Thuoc {
  id: string;
  ten_thuoc: string;
  don_vi: string;
  duong_dung: string;
  gia_ban: number;
  so_luong_ton: number;
} [cite: 43, 44]

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
  searchTerm?: string;
} [cite: 44, 45]

export default function ToaThuocDoctor({ khambenhID }: { khambenhID: string }) {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
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
      searchTerm: "",
    },
  ]); [cite: 47, 48]

  const [currentSearchRowId, setCurrentSearchRowId] = useState<number | null>(null);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const idCounter = useRef(1);
  const { toast } = useToast(); [cite: 49, 50, 51]

  // Tìm kiếm thuốc
  useEffect(() => {
    const searchThuoc = async () => {
      const currentRow = toaThuocList.find(row => row.id === currentSearchRowId);
      const searchValue = currentRow?.searchTerm || "";
      
      if (!searchValue.trim()) {
        setThuocList([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("thuoc")
          .select("id, ten_thuoc, don_vi, duong_dung, gia_ban, so_luong_ton")
          .ilike("ten_thuoc", `%${searchValue.trim()}%`)
          .limit(20);

        if (error) throw error;
        setThuocList(data || []);
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSearchRowId !== null) {
      const timer = setTimeout(searchThuoc, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSearchRowId, toaThuocList]); [cite: 59, 60, 61, 62]

  const handleUpdateRow = (id: number, field: string, value: any) => {
    setToaThuocList((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.id !== id) return row;
        let updatedRow = { ...row, [field]: value };

        if (field === "so_lan_dung" || field === "so_luong_moi_lan") {
          updatedRow.tong_so_luong = soNgayToa * (field === "so_lan_dung" ? value : row.so_lan_dung) * (field === "so_luong_moi_lan" ? value : row.so_luong_moi_lan);
        }
        return updatedRow;
      });
      return updatedRows;
    });
  }; [cite: 63, 65]

  const handleSelectThuoc = (rowId: number, thuoc: Thuoc) => {
    setToaThuocList(prev => prev.map(row => row.id === rowId ? {
      ...row,
      thuoc_id: thuoc.id,
      ten_thuoc: thuoc.ten_thuoc,
      don_vi: thuoc.don_vi,
      duong_dung: thuoc.duong_dung,
      searchTerm: ""
    } : row));
    setShowSearchResults(false);
  }; [cite: 86]

  const handleSave = async () => {
    const dataToInsert = toaThuocList
      .filter((row) => row.thuoc_id !== "")
      .map((row) => ({
        khambenh_id: khambenhID,
        thuoc_id: row.thuoc_id,
        so_lan_dung: row.so_lan_dung,
        so_luong_moi_lan: row.so_luong_moi_lan,
        tong_so_luong: row.tong_so_luong,
        ghi_chu: row.ghi_chu,
      })); [cite: 88]

    if (dataToInsert.length === 0) return;

    try {
      const { error } = await supabase.from("toathuoc").insert(dataToInsert);
      if (error) throw error;
      toast({ title: "Thành công!", description: "Đã lưu toa thuốc!" });
      window.dispatchEvent(new CustomEvent('toaThuocUpdated'));
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  }; [cite: 89, 90, 91, 94, 95]

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center gap-4">
        <Label>Số ngày kê toa</Label>
        <Input
          type="number"
          value={soNgayToa}
          onChange={(e) => setSoNgayToa(Number(e.target.value))}
          className="w-20"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên thuốc</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>Lần/Ngày</TableHead>
            <TableHead>SL/Lần</TableHead>
            <TableHead>Tổng SL</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toaThuocList.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="relative">
                {row.ten_thuoc ? (
                  <div className="font-medium">{row.ten_thuoc}</div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Tìm thuốc..."
                      value={row.searchTerm || ""}
                      onChange={(e) => {
                        handleUpdateRow(row.id, "searchTerm", e.target.value);
                        setCurrentSearchRowId(row.id);
                        setShowSearchResults(true);
                      }}
                      className="pl-8"
                    />
                    {showSearchResults && currentSearchRowId === row.id && thuocList.length > 0 && (
                      <Card className="absolute z-50 top-full mt-1 w-[400px] shadow-lg">
                        <CardContent className="p-0 max-h-60 overflow-y-auto">
                          {thuocList.map(t => (
                            <div
                              key={t.id}
                              onClick={() => handleSelectThuoc(row.id, t)}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                            >
                              <div className="font-bold">{t.ten_thuoc}</div>
                              <div className="text-xs text-gray-500">Tồn: {t.so_luong_ton} | {t.gia_ban.toLocaleString()}đ</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>{row.don_vi}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.so_lan_dung}
                  onChange={(e) => handleUpdateRow(row.id, "so_lan_dung", Number(e.target.value))}
                  className="w-16"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.so_luong_moi_lan}
                  onChange={(e) => handleUpdateRow(row.id, "so_luong_moi_lan", Number(e.target.value))}
                  className="w-16"
                />
              </TableCell>
              <TableCell className="font-bold">{row.tong_so_luong}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => setToaThuocList(prev => prev.filter(r => r.id !== row.id))}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex gap-2">
        <Button onClick={() => setToaThuocList([...toaThuocList, { id: idCounter.current++, thuoc_id: "", ten_thuoc: "", don_vi: "", duong_dung: "", so_lan_dung: 1, so_luong_moi_lan: 1, tong_so_luong: soNgayToa, ghi_chu: "" }])} variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Thêm dòng
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
          Lưu toa thuốc
        </Button>
      </div>
    </div>
  );
}
