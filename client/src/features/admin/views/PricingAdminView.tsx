import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  createPricingPlan,
  deletePricingPlan,
  listCoursesForPricing,
  listPricingPlans,
  updatePricingPlan,
  type CourseRef,
  type PricingPlanItem,
} from '../services/systemAdminApi';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  durationDays: '',
  featuresText: '',
  isActive: true,
  isPopular: false,
  sortOrder: '0',
  courseIds: [] as string[],
};

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingAdminView() {
  const [plans, setPlans] = useState<PricingPlanItem[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPlanItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      const [planList, courseList] = await Promise.all([
        listPricingPlans(),
        listCoursesForPricing(),
      ]);
      setPlans(planList);
      setCourses(courseList);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(plan: PricingPlanItem) {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      durationDays: plan.durationDays ? String(plan.durationDays) : '',
      featuresText: plan.features.join('\n'),
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: String(plan.sortOrder),
      courseIds: plan.courses.map((c) => c.id),
    });
    setOpen(true);
  }

  function toggleCourse(courseId: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(courseId)
        ? f.courseIds.filter((id) => id !== courseId)
        : [...f.courseIds, courseId],
    }));
  }

  async function handleSave() {
    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price < 0) {
      toast.error('Tên và giá hợp lệ là bắt buộc');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      durationDays: form.durationDays ? Number(form.durationDays) : null,
      features: form.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: form.isActive,
      isPopular: form.isPopular,
      sortOrder: Number(form.sortOrder) || 0,
      courseIds: form.courseIds,
    };

    try {
      if (editing) {
        await updatePricingPlan(editing.id, payload);
        toast.success('Đã cập nhật gói');
      } else {
        await createPricingPlan(payload);
        toast.success('Đã tạo gói');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDelete(plan: PricingPlanItem) {
    if (!window.confirm(`Xóa gói "${plan.name}"?`)) return;
    try {
      await deletePricingPlan(plan.id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gói học &amp; giá</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình gói hiển thị trang chủ; thanh toán SePAY tự mở khóa sau webhook.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Thêm gói
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                  {plan.name}
                  {plan.isPopular && <Badge>Phổ biến</Badge>}
                  {!plan.isActive && <Badge variant="secondary">Ẩn</Badge>}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatVnd(plan.price)}
                  {plan.durationDays
                    ? ` · ${plan.durationDays} ngày`
                    : ' · Trọn đời'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(plan)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{plan.courses.map((c) => c.title).join(' · ') || 'Chưa gắn khóa'}</p>
              {plan.features.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
        {!sortedPlans.length && (
          <p className="text-sm text-muted-foreground">Chưa có gói nào.</p>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Sửa gói' : 'Tạo gói mới'}
        className="max-w-xl"
      >
        <div className="space-y-4">
          <Input
            placeholder="Tên gói"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={0}
              placeholder="Giá VND"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
            <Input
              type="number"
              min={1}
              placeholder="Thời hạn (ngày, trống = trọn đời)"
              value={form.durationDays}
              onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
            />
          </div>
          <textarea
            className="min-h-[80px] w-full rounded-lg border bg-background p-2 text-sm"
            placeholder="Tính năng (mỗi dòng một mục)"
            value={form.featuresText}
            onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
          />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Hiển thị
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
              />
              Phổ biến
            </label>
            <Input
              type="number"
              className="w-24"
              placeholder="Thứ tự"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
            {courses.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.courseIds.includes(c.id)}
                  onChange={() => toggleCourse(c.id)}
                />
                <span>
                  {c.jlptLevel} — {c.title}
                </span>
              </label>
            ))}
          </div>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </motion.div>
  );
}
