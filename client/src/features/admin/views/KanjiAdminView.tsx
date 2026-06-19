import { motion } from "framer-motion";
import { Pencil, Plus, ScrollText, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { AdminListSkeleton, emptyStatePresets, ViewState } from "@/components/usable/states";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { kanjiMemoryImageSrc } from "@/services/httpClient";

import {
  AdminListPanel,
  AdminPagination,
  StaffListPageShell,
} from "../components/admin-page-shell";
import {
  AdminListFilters,
  AdminSearchFilter,
  JlptLevelFilter,
} from "../components/admin-list-filters";
import { JLPT_ALL } from "../constants";
import {
  createKanji,
  deleteKanji,
  listKanji,
  uploadKanjiMemoryImage,
  updateKanji,
  type KanjiUpsertBody,
  type KanjiExampleItem,
  type KanjiItem,
} from "../services/adminApi";

type ExampleForm = {
  word: string;
  reading: string;
  meaning: string;
};

type KanjiForm = {
  character: string;
  hanVietPronunciation: string;
  readingsOn: string;
  readingsKun: string;
  meaning: string;
  memoryTip: string;
  memoryImageUrl: string;
  strokeCount: string;
  jlptLevel: string;
  examples: ExampleForm[];
};

const emptyExample = (): ExampleForm => ({
  word: "",
  reading: "",
  meaning: "",
});

const emptyForm = (): KanjiForm => ({
  character: "",
  hanVietPronunciation: "",
  readingsOn: "",
  readingsKun: "",
  meaning: "",
  memoryTip: "",
  memoryImageUrl: "",
  strokeCount: "",
  jlptLevel: "N5",
  examples: [emptyExample(), emptyExample(), emptyExample()],
});

function joinReadings(values: string[]) {
  return values.length > 0 ? values.join(", ") : "—";
}

function normalizeExamples(examples: ExampleForm[]) {
  return examples
    .map((item) => ({
      word: item.word.trim(),
      reading: item.reading.trim(),
      meaning: item.meaning.trim(),
    }))
    .filter((item) => item.word || item.reading || item.meaning)
    .filter((item) => item.word && item.meaning)
    .map((item) => ({
      word: item.word,
      reading: item.reading || undefined,
      meaning: item.meaning,
    }));
}

function kanjiExampleLabel(example: KanjiExampleItem | undefined) {
  if (!example) return "—";
  return `${example.word}${example.reading ? `【${example.reading}】` : ""} ${example.meaning}`;
}

function normalizeMemoryImageStorage(value: string | null | undefined) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf("kanji");
    if (bucketIndex >= 0 && segments[bucketIndex + 1]) {
      return ["kanji", ...segments.slice(bucketIndex + 1).map(decodeURIComponent)].join("/");
    }
  } catch {
    // Already a storage path.
  }
  return value;
}

export function KanjiAdminView() {
  const [items, setItems] = useState<KanjiItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KanjiItem | null>(null);
  const [form, setForm] = useState<KanjiForm>(emptyForm());
  const [memoryImageFile, setMemoryImageFile] = useState<File | null>(null);
  const [memoryImagePreview, setMemoryImagePreview] = useState<string | null>(null);
  const [uploadingMemoryImage, setUploadingMemoryImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listKanji({
        page,
        limit: 30,
        ...(jlptLevel ? { jlptLevel } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, jlptLevel, search]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setJlptLevel(JLPT_ALL);
    setSearch("");
    setPage(1);
  }

  const hasFilters = Boolean(jlptLevel || search.trim());

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setMemoryImageFile(null);
    setMemoryImagePreview(null);
    setOpen(true);
  }

  function openEdit(item: KanjiItem) {
    setEditing(item);
    setForm({
      character: item.character,
      hanVietPronunciation: item.hanVietPronunciation ?? "",
      readingsOn: item.readingsOn.join(", "),
      readingsKun: item.readingsKun.join(", "),
      meaning: item.meaning,
      memoryTip: item.memoryTip ?? "",
      memoryImageUrl: normalizeMemoryImageStorage(item.memoryImageUrl),
      strokeCount: item.strokeCount?.toString() ?? "",
      jlptLevel: item.jlptLevel,
      examples: [0, 1, 2].map((index) => {
        const example = item.examples[index];
        return {
          word: example?.word ?? "",
          reading: example?.reading ?? "",
          meaning: example?.meaning ?? "",
        };
      }),
    });
    setMemoryImageFile(null);
    setMemoryImagePreview(
      item.memoryImageUrl ? kanjiMemoryImageSrc(item) : null,
    );
    setOpen(true);
  }

  function parseList(raw: string) {
    return raw
      .split(/[,、\s]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function buildPayload(): KanjiUpsertBody {
    const strokeCount = form.strokeCount.trim()
      ? Number(form.strokeCount)
      : undefined;

    return {
      character: form.character.trim(),
      hanVietPronunciation: form.hanVietPronunciation.trim() || undefined,
      readingsOn: parseList(form.readingsOn),
      readingsKun: parseList(form.readingsKun),
      meaning: form.meaning.trim(),
      memoryTip: form.memoryTip.trim() || undefined,
      memoryImageUrl: form.memoryImageUrl.trim() || undefined,
      strokeCount:
        strokeCount != null && Number.isFinite(strokeCount)
          ? strokeCount
          : undefined,
      jlptLevel: form.jlptLevel,
      examples: normalizeExamples(form.examples),
    };
  }

  function handleMemoryImagePick(file: File | null) {
    setMemoryImageFile(file);
    if (!file) {
      setMemoryImagePreview(
        editing?.memoryImageUrl ? kanjiMemoryImageSrc(editing) : null,
      );
      return;
    }
    const url = URL.createObjectURL(file);
    setMemoryImagePreview(url);
  }

  async function uploadMemoryImageIfNeeded(): Promise<string | undefined> {
    if (!editing || !memoryImageFile) return undefined;

    setUploadingMemoryImage(true);
    try {
      const uploaded = await uploadKanjiMemoryImage(editing.id, memoryImageFile);
      setForm((prev) => ({ ...prev, memoryImageUrl: uploaded.storagePath }));
      setMemoryImagePreview(kanjiMemoryImageSrc(uploaded.kanji));
      setMemoryImageFile(null);
      return uploaded.storagePath;
    } finally {
      setUploadingMemoryImage(false);
    }
  }

  async function handleSave() {
    if (uploadingMemoryImage) return;
    const payload = buildPayload();

    try {
      if (editing) {
        const uploadedUrl = await uploadMemoryImageIfNeeded();
        const nextPayload = uploadedUrl ? { ...payload, memoryImageUrl: uploadedUrl } : payload;
        await updateKanji(editing.id, nextPayload);
        toast.success("Đã cập nhật kanji");
      } else {
        await createKanji(payload);
        toast.success("Đã thêm kanji");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa kanji này?")) return;
    try {
      await deleteKanji(id);
      toast.success("Đã xóa kanji");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại");
    }
  }

  function setExampleField(
    index: number,
    field: keyof ExampleForm,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((example, exampleIndex) =>
        exampleIndex === index ? { ...example, [field]: value } : example,
      ),
    }));
  }

  return (
    <>
      <StaffListPageShell
        title="Kanji"
        description="Quản lý Kanji, Han-Viet, memory tip và ví dụ thực tế."
        icon={ScrollText}
        iconClassName="bg-tertiary/40"
        tone="secondary"
        chips={['JLPT', 'Mẹo nhớ', 'Ví dụ']}
        total={total}
        totalLabel="Tổng kanji"
        secondaryStat={{ label: 'Trang này', value: items.length }}
        createAction={
          <Button onClick={openCreate} className="w-full">
            <Plus className="size-4" />
            Thêm kanji
          </Button>
        }
        filters={
          <AdminListFilters onReset={hasFilters ? resetFilters : undefined} className="mt-0 border-0 bg-transparent p-0 shadow-none">
            <JlptLevelFilter
              value={jlptLevel}
              onChange={(value) => {
                setJlptLevel(value);
                setPage(1);
              }}
            />
            <AdminSearchFilter
              value={search}
              placeholder="Chữ, nghĩa, mẹo nhớ, ví dụ…"
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </AdminListFilters>
        }
        pagination={
          <AdminPagination
            page={page}
            total={total}
            pageSize={30}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        }
      >
        <AdminListPanel>
          <ViewState
            loading={loading}
            empty={!loading && items.length === 0}
            loadingSkeleton={
              <div className="p-5">
                <AdminListSkeleton count={6} />
              </div>
            }
            loadingLabel="Đang tải kanji…"
            emptyEmbedded
            {...emptyStatePresets.admin}
            emptyTone="kanji"
            emptyAction={
              <Button type="button" size="sm" onClick={openCreate}>
                Thêm kanji
              </Button>
            }
          >
            <div className="divide-y divide-border/60">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex flex-wrap items-start gap-3 px-5 py-4 hover:bg-muted/40"
                >
                  <div className="min-w-[110px] font-jp text-3xl font-semibold">
                    {item.character}
                  </div>
                  <div className="min-w-[180px] text-sm">
                    <p className="font-medium">
                      {item.hanVietPronunciation ?? "—"}
                    </p>
                    <p className="text-muted-foreground">
                      {joinReadings(item.readingsKun)}
                    </p>
                    <p className="text-muted-foreground">
                      On: {joinReadings(item.readingsOn)}
                    </p>
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{item.meaning}</p>
                    <p className="mt-1 text-muted-foreground">
                      {item.memoryTip ?? "—"}
                    </p>
                    {item.memoryImageUrl && (
                      <img
                        src={kanjiMemoryImageSrc(item)}
                        alt={`Memoric ${item.character}`}
                        loading="lazy"
                        decoding="async"
                        className="mt-2 h-20 w-40 rounded object-contain border border-border/60 bg-muted/20 p-1"
                      />
                    )}
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {item.examples
                        .slice(0, 3)
                        .map((example, exampleIndex) => (
                          <p key={example.id}>
                            Word {exampleIndex + 1}:{" "}
                            {kanjiExampleLabel(example)}
                          </p>
                        ))}
                      {item.examples.length === 0 && <p>Chưa có ví dụ.</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.jlptLevel}</Badge>
                      <Badge variant="outline">
                        {item.strokeCount ?? "—"} strokes
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
          </ViewState>
        </AdminListPanel>
      </StaffListPageShell>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Sửa kanji" : "Thêm kanji"}
      >
        <div className="grid gap-3">
          <Input
            placeholder="Kanji"
            value={form.character}
            onChange={(e) => setForm({ ...form, character: e.target.value })}
          />
          <Input
            placeholder="Han-Viet pronunciation"
            value={form.hanVietPronunciation}
            onChange={(e) =>
              setForm({ ...form, hanVietPronunciation: e.target.value })
            }
          />
          <Input
            placeholder="Kun (cách nhau dấu phẩy)"
            value={form.readingsKun}
            onChange={(e) => setForm({ ...form, readingsKun: e.target.value })}
          />
          <Input
            placeholder="On (cách nhau dấu phẩy)"
            value={form.readingsOn}
            onChange={(e) => setForm({ ...form, readingsOn: e.target.value })}
          />
          <Input
            placeholder="Nghĩa"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
          />
          <Input
            placeholder="Memory tip"
            value={form.memoryTip}
            onChange={(e) => setForm({ ...form, memoryTip: e.target.value })}
          />
          <div className="rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-sm font-medium">Ảnh tượng hình (memoric)</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_160px] sm:items-start">
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={!editing || uploadingMemoryImage}
                  onChange={(e) =>
                    handleMemoryImagePick(e.target.files?.[0] ?? null)
                  }
                />
                {!editing && (
                  <p className="text-xs text-muted-foreground">
                    Hãy lưu kanji trước, sau đó upload ảnh (cần ID để gắn ảnh).
                  </p>
                )}
                {form.memoryImageUrl && (
                  <p className="text-xs text-muted-foreground break-all">
                    Storage: {form.memoryImageUrl}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                {memoryImagePreview ? (
                  <img
                    src={memoryImagePreview}
                    alt="Memory"
                    className="h-36 w-full rounded object-contain"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Chưa có ảnh.
                  </p>
                )}
              </div>
            </div>
          </div>
          <Input
            placeholder="Stroke count"
            value={form.strokeCount}
            onChange={(e) => setForm({ ...form, strokeCount: e.target.value })}
          />
          <Input
            placeholder="JLPT level"
            value={form.jlptLevel}
            onChange={(e) => setForm({ ...form, jlptLevel: e.target.value })}
          />
          <div className="rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-sm font-medium">Ví dụ thực tế</p>
            <div className="space-y-3">
              {form.examples.map((example, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-border/50 p-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    Word {index + 1}
                  </p>
                  <Input
                    placeholder="Word"
                    value={example.word}
                    onChange={(e) =>
                      setExampleField(index, "word", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Reading"
                    value={example.reading}
                    onChange={(e) =>
                      setExampleField(index, "reading", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Meaning"
                    value={example.meaning}
                    onChange={(e) =>
                      setExampleField(index, "meaning", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </>
  );
}
