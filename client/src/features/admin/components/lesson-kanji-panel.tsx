import { motion } from "framer-motion";
import { Check, LinkIcon, Search, Unlink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { JLPT_ALL } from "../constants";
import {
  assignLessonKanji,
  listKanji,
  type KanjiItem,
} from "../services/adminApi";

const LEVEL_OPTIONS = [
  { value: JLPT_ALL, label: "Tất cả cấp" },
  { value: "N5", label: "N5" },
  { value: "N4", label: "N4" },
  { value: "N3", label: "N3" },
] as const;

type Props = {
  lessonId: string;
  jlptLevel: string;
  items: KanjiItem[];
  onUpdated: () => void;
};

export function LessonKanjiPanel({
  lessonId,
  jlptLevel,
  items,
  onUpdated,
}: Props) {
  /* ── picker state ── */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pool, setPool] = useState<KanjiItem[]>([]);
  const [poolTotal, setPoolTotal] = useState(0);
  const [poolPage, setPoolPage] = useState(1);
  const [poolLoading, setPoolLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ── picker filters ── */
  const [filterLevel, setFilterLevel] = useState(jlptLevel || JLPT_ALL);
  const [filterSearch, setFilterSearch] = useState("");

  const POOL_LIMIT = 30;
  const assignedIds = new Set(items.map((k) => k.id));

  /* ── load pool from API ── */
  const loadPool = useCallback(async () => {
    setPoolLoading(true);
    try {
      const res = await listKanji({
        ...(filterLevel ? { jlptLevel: filterLevel } : {}),
        ...(filterSearch.trim() ? { search: filterSearch.trim() } : {}),
        limit: POOL_LIMIT,
        page: poolPage,
      });
      setPool(res.items);
      setPoolTotal(res.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải danh sách kanji");
    } finally {
      setPoolLoading(false);
    }
  }, [filterLevel, filterSearch, poolPage]);

  /* reload when picker is opened or filters change */
  useEffect(() => {
    if (pickerOpen) loadPool();
  }, [pickerOpen, loadPool]);

  /* ── open picker ── */
  function openPicker() {
    setFilterLevel(jlptLevel || JLPT_ALL);
    setFilterSearch("");
    setPoolPage(1);
    setSelected(new Set());
    setPickerOpen(true);
  }

  /* ── toggle a single kanji selection ── */
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── assign helpers ── */
  async function assignIds(ids: string[]) {
    await assignLessonKanji(lessonId, ids);
    onUpdated();
  }

  /* ── batch assign selected ── */
  async function handleAssignSelected() {
    if (selected.size === 0) return;
    try {
      const currentIds = items.map((k) => k.id);
      const newIds = [...selected].filter((id) => !assignedIds.has(id));
      await assignIds([...currentIds, ...newIds]);
      toast.success(`Đã gán ${newIds.length} kanji`);
      setSelected(new Set());
      setPickerOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gán thất bại");
    }
  }

  /* ── assign single from picker ── */
  async function handleAddOne(id: string) {
    try {
      await assignIds([...items.map((k) => k.id), id]);
      toast.success("Đã gán kanji");
      // refresh pool to reflect change
      loadPool();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gán thất bại");
    }
  }

  /* ── unlink from lesson ── */
  async function handleUnlink(id: string) {
    if (!confirm("Gỡ kanji khỏi tiết học này?")) return;
    try {
      await assignIds(items.map((k) => k.id).filter((x) => x !== id));
      toast.success("Đã gỡ kanji");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gỡ thất bại");
    }
  }

  /* ── helpers ── */
  const poolPages = Math.max(1, Math.ceil(poolTotal / POOL_LIMIT));
  const availablePool = pool.filter((k) => !assignedIds.has(k.id));
  const alreadyAssignedInPool = pool.filter((k) => assignedIds.has(k.id));

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Kanji ({items.length})</CardTitle>
        <Button size="sm" onClick={openPicker}>
          <LinkIcon className="size-4" />
          Gán kanji có sẵn
        </Button>
      </CardHeader>

      <CardContent className="divide-y divide-border/60 p-0">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Chưa có kanji trong tiết. Nhấn <strong>"Gán kanji có sẵn"</strong>{" "}
            để thêm.
          </p>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-muted/30"
            >
              <div className="font-jp text-2xl font-semibold">
                {item.character}
              </div>
              <div className="min-w-[100px] text-sm">
                <p className="font-medium">
                  {item.hanVietPronunciation ?? "—"}
                </p>
                <p className="text-muted-foreground">{item.meaning}</p>
                {item.examples.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.examples
                      .map(
                        (example) =>
                          `${example.word}${example.reading ? `【${example.reading}】` : ""}`,
                      )
                      .join(" • ")}
                  </p>
                )}
              </div>
              <div className="flex-1" />
              <Badge variant="outline">{item.jlptLevel}</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => handleUnlink(item.id)}
              >
                <Unlink className="size-3.5" />
                Gỡ
              </Button>
            </motion.div>
          ))
        )}
      </CardContent>

      {/* ── PICKER DIALOG ── */}
      <Dialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Gán kanji có sẵn vào tiết"
        className="max-w-2xl"
      >
        {/* filters row */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
          {/* JLPT level filter */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Cấp JLPT
            </span>
            <select
              className="h-9 min-w-[110px] rounded-lg border border-input bg-background px-3 text-sm shadow-xs"
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setPoolPage(1);
              }}
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value || "__all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {/* Search by Hán Việt / Nghĩa Việt */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Tìm (Hán Việt, nghĩa…)
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 w-[200px] pl-8 md:w-[260px]"
                placeholder="VD: Nhật, mặt trời…"
                value={filterSearch}
                onChange={(e) => {
                  setFilterSearch(e.target.value);
                  setPoolPage(1);
                }}
              />
            </div>
          </label>
        </div>

        {/* selected count + batch assign button */}
        {selected.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="text-sm font-medium">
              Đã chọn <strong>{selected.size}</strong> kanji
            </span>
            <Button size="sm" onClick={handleAssignSelected}>
              <Check className="size-4" />
              Gán {selected.size} kanji đã chọn
            </Button>
          </div>
        )}

        {/* pool list */}
        <div className="max-h-[45vh] space-y-1.5 overflow-y-auto pr-1">
          {poolLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Đang tải…
            </p>
          ) : availablePool.length === 0 &&
            alreadyAssignedInPool.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy kanji phù hợp.
            </p>
          ) : (
            <>
              {/* available kanji */}
              {availablePool.map((k) => {
                const isSelected = selected.has(k.id);
                return (
                  <div
                    key={k.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 hover:border-border hover:bg-muted/40"
                    }`}
                    onClick={() => toggleSelect(k.id)}
                  >
                    {/* checkbox */}
                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5" />}
                    </div>

                    {/* kanji character */}
                    <span className="font-jp text-xl font-semibold">
                      {k.character}
                    </span>

                    {/* details */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {k.hanVietPronunciation ?? "—"}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {k.meaning}
                      </p>
                    </div>

                    <Badge variant="outline" className="shrink-0">
                      {k.jlptLevel}
                    </Badge>

                    {/* quick assign single */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddOne(k.id);
                      }}
                    >
                      Gán
                    </Button>
                  </div>
                );
              })}

              {/* already assigned (grayed out) */}
              {alreadyAssignedInPool.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 text-sm opacity-60"
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded border border-primary bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </div>
                  <span className="font-jp text-xl font-semibold">
                    {k.character}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {k.hanVietPronunciation ?? "—"}
                    </p>
                    <p className="truncate text-muted-foreground">
                      {k.meaning}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    Đã gán
                  </Badge>
                </div>
              ))}
            </>
          )}
        </div>

        {/* pagination */}
        {poolPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 border-t border-border/60 pt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={poolPage <= 1}
              onClick={() => setPoolPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="text-xs text-muted-foreground">
              Trang {poolPage} / {poolPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={poolPage >= poolPages}
              onClick={() => setPoolPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </Dialog>
    </Card>
  );
}
