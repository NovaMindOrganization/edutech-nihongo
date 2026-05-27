import { motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  AdminListFilters,
  AdminSearchFilter,
} from "../components/admin-list-filters";
import {
  createRadical,
  deleteRadical,
  listRadicals,
  updateRadical,
  type RadicalUpsertBody,
  type RadicalItem,
} from "../services/adminApi";

type RadicalForm = {
  character: string;
  sinoVietnamese: string;
  meaning: string;
  strokeCount: string;
};

const emptyForm = (): RadicalForm => ({
  character: "",
  sinoVietnamese: "",
  meaning: "",
  strokeCount: "",
});

export function RadicalsAdminView() {
  const [items, setItems] = useState<RadicalItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RadicalItem | null>(null);
  const [form, setForm] = useState<RadicalForm>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRadicals({
        page,
        limit: 30,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setSearch("");
    setPage(1);
  }

  const hasFilters = Boolean(search.trim());

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(item: RadicalItem) {
    setEditing(item);
    setForm({
      character: item.character,
      sinoVietnamese: item.sinoVietnamese,
      meaning: item.meaning,
      strokeCount: item.strokeCount.toString(),
    });
    setOpen(true);
  }

  function buildPayload(): RadicalUpsertBody {
    return {
      character: form.character.trim(),
      sinoVietnamese: form.sinoVietnamese.trim(),
      meaning: form.meaning.trim(),
      strokeCount: parseInt(form.strokeCount, 10),
    };
  }

  async function handleSave() {
    const payload = buildPayload();
    if (
      !payload.character ||
      !payload.sinoVietnamese ||
      !payload.meaning ||
      !payload.strokeCount
    ) {
      toast.error("Vui lòng điền đầy đủ các trường.");
      return;
    }

    try {
      if (editing) {
        await updateRadical(editing.id, payload);
        toast.success("Đã cập nhật bộ thủ");
      } else {
        await createRadical(payload);
        toast.success("Đã thêm bộ thủ");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa bộ thủ này?")) return;
    try {
      await deleteRadical(id);
      toast.success("Đã xóa bộ thủ");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">214 Bộ Thủ</h1>
          <p className="text-sm text-muted-foreground">
            {total} mục — quản lý bộ thủ Hán tự.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm bộ thủ
        </Button>
      </div>

      <AdminListFilters onReset={hasFilters ? resetFilters : undefined}>
        <AdminSearchFilter
          value={search}
          placeholder="Số thứ tự, chữ, hán việt, nghĩa…"
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </AdminListFilters>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Không có kết quả.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex flex-wrap items-start gap-3 px-5 py-4 hover:bg-muted/40"
                >
                  <div className="min-w-[60px] text-lg font-bold text-muted-foreground">
                    #{item.radicalIndex}
                  </div>
                  <div className="min-w-[100px] font-jp text-3xl font-semibold">
                    {item.character}
                  </div>
                  <div className="min-w-[180px] text-sm">
                    <p className="font-medium text-lg">
                      {item.sinoVietnamese}
                    </p>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="mt-1">{item.meaning}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {item.strokeCount} strokes
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 30))}
        </span>
        <Button
          variant="outline"
          disabled={page * 30 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Sửa bộ thủ" : "Thêm bộ thủ"}
      >
        <div className="grid gap-3">
          {editing && (
            <p className="text-sm text-muted-foreground">
              Số thứ tự: #{editing.radicalIndex}
            </p>
          )}
          <Input
            placeholder="Bộ thủ (vd: 一, 丨, 丶...)"
            value={form.character}
            onChange={(e) => setForm({ ...form, character: e.target.value })}
          />
          <Input
            placeholder="Âm Hán Việt"
            value={form.sinoVietnamese}
            onChange={(e) =>
              setForm({ ...form, sinoVietnamese: e.target.value })
            }
          />
          <Input
            placeholder="Nghĩa tiếng Việt"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
          />
          <Input
            placeholder="Số nét"
            type="number"
            value={form.strokeCount}
            onChange={(e) => setForm({ ...form, strokeCount: e.target.value })}
          />
          <Button onClick={handleSave} className="mt-2">Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
