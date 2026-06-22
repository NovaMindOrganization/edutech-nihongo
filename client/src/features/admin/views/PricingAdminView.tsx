import { Check, CreditCard, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InsetEmpty } from '@/components/usable/inset-empty';
import { cn } from '@/lib/utils';

import {
  AdminPageShell,
  AdminStatPill,
} from '../components/admin-page-shell';
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

function formatDuration(days: number | null) {
  if (!days) return 'Trọn đời';
  if (days >= 365) return `${Math.round(days / 365)} năm`;
  if (days >= 30) return `${Math.round(days / 30)} tháng`;
  return `${days} ngày`;
}

function PlanAdminCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: PricingPlanItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isFree = plan.price <= 0;

  return (
    <article
      className={cn(
        'depth-interactive relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface-paper/50 p-5 shadow-premium card-lift',
        plan.isPopular && 'border-brand/40 ring-1 ring-brand/20',
        !plan.isActive && 'opacity-70',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border',
          plan.isPopular ? 'bg-brand-soft/60' : 'bg-secondary/50',
        )}
      />

      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {plan.isPopular && (
            <Badge className="border-0 bg-brand text-brand-foreground">
              <Sparkles className="mr-1 size-3" />
              Phổ biến
            </Badge>
          )}
          {!plan.isActive && <Badge variant="secondary">Ẩn</Badge>}
          <span className="rounded-full border border-border bg-tertiary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-tertiary-foreground">
            #{plan.sortOrder}
          </span>
        </div>
        <AppIcon icon={Check} size="sm" className={isFree ? 'bg-quaternary' : 'bg-secondary'} />
      </div>

      <h3 className="relative font-display text-xl font-extrabold tracking-tight">{plan.name}</h3>
      {plan.description ? (
        <p className="relative mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">
          {plan.description}
        </p>
      ) : null}

      <div className="relative mt-4">
        <p className="font-display text-3xl font-extrabold tracking-tight text-primary">
          {isFree ? 'Miễn phí' : formatVnd(plan.price)}
        </p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {formatDuration(plan.durationDays)}
        </p>
      </div>

      {plan.courses.length > 0 ? (
        <p className="relative mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground">
          {plan.courses.length} khóa: {plan.courses.map((c) => c.jlptLevel ?? c.title).join(', ')}
        </p>
      ) : (
        <p className="relative mt-4 text-xs font-medium italic text-muted-foreground">Chưa gắn khóa</p>
      )}

      {plan.features.length > 0 ? (
        <ul className="relative mt-4 flex-1 space-y-1.5">
          {plan.features.slice(0, 5).map((f) => (
            <li key={f} className="flex gap-2 text-sm font-medium">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
          {plan.features.length > 5 ? (
            <li className="text-xs font-bold text-muted-foreground">+{plan.features.length - 5} tính năng</li>
          ) : null}
        </ul>
      ) : null}

      <div className="relative mt-5 flex gap-2 border-t border-border/70 pt-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          <Pencil className="mr-1.5 size-3.5" />
          Sửa
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </article>
  );
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

  const activeCount = useMemo(() => plans.filter((p) => p.isActive).length, [plans]);
  const popularCount = useMemo(() => plans.filter((p) => p.isPopular).length, [plans]);

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
    <AdminPageShell
      title="Gói học & giá"
      description="Cấu hình gói hiển thị trang chủ; thanh toán SePAY tự mở khóa sau webhook."
      icon={CreditCard}
      iconClassName="bg-secondary"
      tone="secondary"
      chips={['Trang chủ', 'SePAY', 'Khóa học', 'Ghi danh']}
      footer="Gói ẩn không hiển thị công khai — webhook vẫn xử lý đơn đã tạo."
      headerExtra={
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <AdminStatPill label="Tổng gói" value={plans.length} accent="brand" />
            <AdminStatPill label="Đang hiển thị" value={activeCount} />
          </div>
          <Button onClick={openCreate} className="w-full">
            <Plus className="mr-1.5 size-4" />
            Thêm gói
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {popularCount > 0 ? (
          <p className="rounded-xl border border-brand/20 bg-brand-soft/20 px-4 py-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="mr-1.5 inline size-4 text-brand" />
            {popularCount} gói được đánh dấu phổ biến — hiển thị nổi bật trên trang giá.
          </p>
        ) : null}

        {sortedPlans.length === 0 ? (
          <InsetEmpty
            tone="courses"
            title="Chưa có gói nào"
            description="Tạo gói học đầu tiên để học viên có thể đăng ký."
            action={
              <Button onClick={openCreate}>
                <Plus className="mr-1.5 size-4" />
                Tạo gói đầu tiên
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedPlans.map((plan) => (
              <PlanAdminCard
                key={plan.id}
                plan={plan}
                onEdit={() => openEdit(plan)}
                onDelete={() => handleDelete(plan)}
              />
            ))}
          </div>
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
            className="min-h-[80px] w-full rounded-xl border border-border bg-background p-3 text-sm shadow-sm"
            placeholder="Tính năng (mỗi dòng một mục)"
            value={form.featuresText}
            onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
          />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Hiển thị
            </label>
            <label className="flex items-center gap-2 font-medium">
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
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border p-3">
            {courses.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm font-medium">
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
    </AdminPageShell>
  );
}
