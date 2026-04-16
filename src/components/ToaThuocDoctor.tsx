import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  searchTerm?: string;
}

interface ToaThuocDoctorProps {
  khambenhID: string;
}

export interface ToaThuocDoctorRef {
  focus: () => void;
}

export default function ToaThuocDoctor({ khambenhID }: ToaThuocDoctorProps) {
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [toaThuocList, setToaThuocList] = useState<ToaThuocRow[]>([
    {
      id: 0,
      thuoc_id: "",
      ten_thuoc: "",
      don_vi: "",
      duong_dung: "",
      so_lan_dung: 1,
      so_luong_moi_lan: 1,
      tong_so_luong: 1,
      ghi_chu: "",
      searchTerm: "",
    },
  ]);
  const [currentSearchRowId, setCurrentSearchRowId] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [soNgayToa, setSoNgayToa] = useState<number>(3);
  const [ngayHenTaiKham, setNgayHenTaiKham] = useState<string>("");
  const [popupDirection, setPopupDirection] = useState<'up' | 'down'>('down');
  const idCounter = useRef(1);
  const soNgayToaRef = useRef<HTMLInputElement>(null);
  const ngayHenTaiKhamRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const focusFirstMedicineSearch = () => {
    // Focus vào ô search thuốc của dòng đầu tiên
    setTimeout(() => {
      const firstSearchInput = document.querySelector('input[data-field="search_thuoc"]') as HTMLInputElement;
      if (firstSearchInput) {
        firstSearchInput.focus();
        firstSearchInput.click(); // Trigger focus để mở dropdown
      }
    }, 100);
  };

  // Tính toán vị trí popup autocomplete
  const calculatePopupDirection = (inputElement: HTMLInputElement) => {
    const rect = inputElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Nếu không đủ chỗ phía dưới (< 200px) và phía trên có nhiều chỗ hơn
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setPopupDirection('up');
    } else {
      setPopupDirection('down');
    }
  };



  // Tìm kiếm thuốc cho dòng hiện tại
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
        toast({
          title: "Lỗi",
          description: "Lỗi tìm kiếm thuốc: " + error.message,
          variant: "destructive",
        });
        setThuocList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSearchRowId !== null) {
      const timer = setTimeout(searchThuoc, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSearchRowId, toaThuocList, toast]);

  const handleUpdateRow = (id: number, field: string, value: any) => {
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
          } else {
            updatedRow.ten_thuoc = "";
            updatedRow.don_vi = "";
            updatedRow.duong_dung = "";
          }
        }

        if (field === "so_lan_dung" || field === "so_luong_moi_lan") {
          const sl1 = field === "so_lan_dung" ? value : row.so_lan_dung;
          const sl2 = field === "so_luong_moi_lan" ? value : row.so_luong_moi_lan;
          updatedRow.tong_so_luong = soNgayToa * sl1 * sl2;
        }

        return updatedRow;
      });

      // Tự động thêm dòng mới nếu dòng cuối đã có thuốc
      const lastRow = updatedRows[updatedRows.length - 1];
      if (
        lastRow.thuoc_id !== "" &&
        updatedRows.filter((r) => r.thuoc_id === "").length === 0
      ) {
        updatedRows.push({
          id: idCounter.current++,
          thuoc_id: "",
          ten_thuoc: "",
          don_vi: "",
          duong_dung: "",
          so_lan_dung: 1,
          so_luong_moi_lan: 1,
          tong_so_luong: soNgayToa * 1 * 1,
          ghi_chu: "",
        });
      }

      return updatedRows;
    });
  };

  const handleRemoveRow = (id: number) => {
    setToaThuocList((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    setToaThuocList((prev) => [
      ...prev,
      {
        id: idCounter.current++,
        thuoc_id: "",
        ten_thuoc: "",
        don_vi: "",
        duong_dung: "",
        so_lan_dung: 1,
        so_luong_moi_lan: 1,
        tong_so_luong: soNgayToa * 1 * 1,
        ghi_chu: "",
        searchTerm: "",
      },
    ]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, currentRowId: number, field: string) => {
    if (field === 'search_thuoc' && showSearchResults && thuocList.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, thuocList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < thuocList.length) {
          handleSelectThuoc(currentRowId, thuocList[selectedIndex]);
          // Sau khi chọn thuốc, chuyển sang ô số lần dùng
          setTimeout(() => {
            const nextInput = document.querySelector(`[data-row-id="${currentRowId}"][data-field="so_lan_dung"]`) as HTMLInputElement;
            nextInput?.focus();
          }, 100);
        }
        return;
      }
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentIndex = toaThuocList.findIndex(row => row.id === currentRowId);
      
      // Navigation logic based on field
      if (field === 'search_thuoc') {
        // From "tìm thuốc" -> "số lần dùng"
        const nextInput = document.querySelector(`[data-row-id="${currentRowId}"][data-field="so_lan_dung"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (field === 'so_lan_dung') {
        // From "số lần dùng" -> "số lượng mỗi lần"
        const nextInput = document.querySelector(`[data-row-id="${currentRowId}"][data-field="so_luong_moi_lan"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (field === 'so_luong_moi_lan') {
        // From "số lượng mỗi lần" -> "ghi chú"
        const nextInput = document.querySelector(`[data-row-id="${currentRowId}"][data-field="ghi_chu"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (field === 'ghi_chu') {
        // From "ghi chú" -> next row "tìm thuốc" or add new row
        if (currentIndex < toaThuocList.length - 1) {
          const nextRowId = toaThuocList[currentIndex + 1].id;
          const nextInput = document.querySelector(`[data-row-id="${nextRowId}"][data-field="search_thuoc"]`) as HTMLInputElement;
          nextInput?.focus();
        } else {
          // Auto add new row and focus on its first input
          handleAddRow();
          setTimeout(() => {
            const newRowId = idCounter.current - 1;
            const newInput = document.querySelector(`[data-row-id="${newRowId}"][data-field="search_thuoc"]`) as HTMLInputElement;
            newInput?.focus();
          }, 100);
        }
      }
    }
  };

  const handleSelectThuoc = (rowId: number, thuoc: Thuoc) => {
    handleUpdateRow(rowId, "thuoc_id", thuoc.id);
    handleUpdateRow(rowId, "searchTerm", "");
    setShowSearchResults(false);
    setCurrentSearchRowId(null);
    
    // Auto focus to next input
    setTimeout(() => {
      const nextInput = document.querySelector(`[data-row-id="${rowId}"][data-field="so_lan_dung"]`) as HTMLInputElement;
      nextInput?.focus();
    }, 100);
  };

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
      }));

    if (dataToInsert.length === 0) {
      toast({
        title: "Lỗi",
        description: "Chưa có thuốc nào để lưu.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("toathuoc").insert(dataToInsert);
      if (error) throw error;

      toast({
        title: "Thành công!",
        description: "Đã lưu toa thuốc thành công!",
      });

      // Reset form
      setToaThuocList([
        {
          id: 0,
          thuoc_id: "",
          ten_thuoc: "",
          don_vi: "",
          duong_dung: "",
          so_lan_dung: 1,
          so_luong_moi_lan: 1,
          tong_so_luong: soNgayToa * 1 * 1,
          ghi_chu: "",
          searchTerm: "",
        },
      ]);

      // Trigger refresh của toa thuốc history để hiển thị toa mới
      window.dispatchEvent(new CustomEvent('toaThuocUpdated'));
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Lỗi khi lưu toa thuốc: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Cập nhật tổng số lượng khi thay đổi số ngày toa
  useEffect(() => {
    setToaThuocList((prev) =>
      prev.map((row) => ({
        ...row,
        tong_so_luong: soNgayToa * row.so_lan_dung * row.so_luong_moi_lan,
      }))
    );
  }, [soNgayToa]);

  return (
    <div className="space-y-4 relative z-50">
      {/* Thông tin toa thuốc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-white">Số ngày kê toa</Label>
          <Input
            ref={soNgayToaRef}
            type="number"
            value={soNgayToa}
            onChange={(e) => setSoNgayToa(Math.max(1, Math.min(30, +e.target.value)))}
            onKeyDown={(e) => handleKeyDown(e, ngayHenTaiKhamRef)}
            min={1}
            max={30}
            className="bg-white dark:bg-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-white">Ngày hẹn tái khám</Label>
          <Input
            ref={ngayHenTaiKhamRef}
            type="date"
            value={ngayHenTaiKham}
            onChange={(e) => setNgayHenTaiKham(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                focusFirstMedicineSearch();
              }
            }}
            className="bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Bảng toa thuốc */}
      <div className="border rounded-md bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thuốc</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Số lần/ngày</TableHead>
              <TableHead>SL mỗi lần</TableHead>
              <TableHead>Dạng dùng</TableHead>
              <TableHead>Tổng SL</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {toaThuocList.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="relative">
                  {row.ten_thuoc ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {row.ten_thuoc}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {row.duong_dung}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateRow(row.id, "thuoc_id", "")}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Gõ tên thuốc..."
                        value={row.searchTerm || ""}
                        onChange={(e) => {
                          handleUpdateRow(row.id, "searchTerm", e.target.value);
                          setCurrentSearchRowId(row.id);
                          setShowSearchResults(true);
                          setSelectedIndex(-1); // Reset selection when typing
                        }}
                        onKeyDown={(e) => handleInputKeyDown(e, row.id, "search_thuoc")}
                        onFocus={(e) => {
                          setCurrentSearchRowId(row.id);
                          setShowSearchResults(true);
                          setSelectedIndex(-1);
                          calculatePopupDirection(e.target as HTMLInputElement);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSearchResults(false), 200);
                        }}
                        data-row-id={row.id}
                        data-field="search_thuoc"
                        className="pl-8 bg-white dark:bg-gray-700 text-sm"
                      />
                      
                      {/* Dialog tìm kiếm thuốc hiện đại */}
                      {showSearchResults && currentSearchRowId === row.id && row.searchTerm && (
                        <Card className={`absolute left-0 w-[600px] max-h-96 overflow-hidden shadow-2xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 ${
                          popupDirection === 'up' 
                            ? 'bottom-full mb-2' 
                            : 'top-full mt-2'
                        }`} style={{ zIndex: 99999 }}>
                          <CardContent className="p-0">
                            {isLoading ? (
                              <div className="p-6 text-center text-gray-500">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                Đang tìm kiếm thuốc...
                              </div>
                            ) : thuocList.length > 0 ? (
                              <div className="max-h-96 overflow-y-auto">
                                {thuocList.map((thuoc, index) => (
                                  <div
                                    key={thuoc.id}
                                    className={`p-6 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                      index === selectedIndex 
                                        ? 'bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                    onClick={() => handleSelectThuoc(row.id, thuoc)}
                                  >
                                    <div className="flex justify-between items-start gap-6">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xl text-gray-900 dark:text-white mb-3 leading-tight">
                                          {thuoc.ten_thuoc}
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full font-semibold text-base">
                                            {thuoc.duong_dung}
                                          </span>
                                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full font-semibold text-base">
                                            Đơn vị: {thuoc.don_vi}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                                          Tồn kho: {thuoc.so_luong_ton}
                                        </div>
                                        <div className="text-base text-gray-600 dark:text-gray-400 font-semibold">
                                          {thuoc.gia_ban.toLocaleString('vi-VN')}đ
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-3">🔍</div>
                                <div className="text-lg font-medium">Không tìm thấy thuốc nào</div>
                                <div className="text-sm mt-1">Thử nhập từ khóa khác</div>
                              </div>
                            )}
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
                    onChange={(e) => handleUpdateRow(row.id, "so_lan_dung", +e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, row.id, "so_lan_dung")}
                    data-row-id={row.id}
                    data-field="so_lan_dung"
                    min={1}
                    className="w-20"
                    placeholder="Lần/ngày"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.so_luong_moi_lan}
                    onChange={(e) => handleUpdateRow(row.id, "so_luong_moi_lan", +e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, row.id, "so_luong_moi_lan")}
                    data-row-id={row.id}
                    data-field="so_luong_moi_lan"
                    min={1}
                    className="w-20"
                    placeholder="SL/lần"
                  />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {row.duong_dung}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {row.tong_so_luong}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.ghi_chu}
                    onChange={(e) => handleUpdateRow(row.id, "ghi_chu", e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, row.id, "ghi_chu")}
                    data-row-id={row.id}
                    data-field="ghi_chu"
                    placeholder="Ghi chú... (Enter để dòng tiếp)"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleAddRow} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Thêm dòng
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          💾 Lưu toa thuốc
        </Button>
        <Button variant="outline">
          🖨️ In toa
        </Button>
      </div>
    </div>
  );
}
