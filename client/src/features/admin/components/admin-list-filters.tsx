import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { JLPT_ALL, JLPT_LEVELS, type PublishedFilter, type UserStatusFilter } from '../constants';

const selectClass =
  'h-9 min-w-[120px] rounded-lg border border-input bg-background px-3 text-sm shadow-xs';

type SelectOption = { value: string; label: string };

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      className={cn(selectClass, className)}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value || '__all'} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function AdminListFilters({
  children,
  onReset,
  className,
}: {
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-muted/25 p-3',
        className,
      )}
    >
      {children}
      {onReset && (
        <Button type="button" variant="ghost" size="sm" className="h-9 gap-1" onClick={onReset}>
          <X className="size-3.5" />
          Xóa lọc
        </Button>
      )}
    </div>
  );
}

export function JlptLevelFilter({
  value,
  onChange,
  label = 'JLPT',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <FilterField label={label}>
      <FilterSelect
        value={value}
        onChange={onChange}
        options={[
          { value: JLPT_ALL, label: 'Tất cả cấp' },
          ...JLPT_LEVELS.map((lv) => ({ value: lv, label: lv })),
        ]}
      />
    </FilterField>
  );
}

export function AdminSearchFilter({
  value,
  onChange,
  placeholder = 'Tìm kiếm…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FilterField label="Tìm kiếm">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 w-[200px] pl-8 md:w-[240px]"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </FilterField>
  );
}

export function CourseFilter({
  value,
  onChange,
  courses,
}: {
  value: string;
  onChange: (value: string) => void;
  courses: Array<{ id: string; title: string; jlptLevel?: string }>;
}) {
  return (
    <FilterField label="Khóa học">
      <FilterSelect
        value={value}
        onChange={onChange}
        className="min-w-[180px]"
        options={[
          { value: '', label: 'Tất cả khóa' },
          ...courses.map((c) => ({
            value: c.id,
            label: c.jlptLevel ? `${c.title} (${c.jlptLevel})` : c.title,
          })),
        ]}
      />
    </FilterField>
  );
}

export function LessonFilter({
  value,
  onChange,
  lessons,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  lessons: Array<{ id: string; title: string; orderIndex: number }>;
  disabled?: boolean;
}) {
  return (
    <FilterField label="Tiết học">
      <FilterSelect
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="min-w-[160px]"
        options={[
          { value: '', label: 'Tất cả tiết' },
          ...lessons.map((l) => ({
            value: l.id,
            label: `#${l.orderIndex} ${l.title}`,
          })),
        ]}
      />
    </FilterField>
  );
}

export function PublishedFilterSelect({
  value,
  onChange,
}: {
  value: PublishedFilter;
  onChange: (value: PublishedFilter) => void;
}) {
  return (
    <FilterField label="Trạng thái">
      <FilterSelect
        value={value}
        onChange={(v) => onChange(v as PublishedFilter)}
        options={[
          { value: '', label: 'Tất cả' },
          { value: 'published', label: 'Đã xuất bản' },
          { value: 'draft', label: 'Nháp' },
        ]}
      />
    </FilterField>
  );
}

export function UserRoleFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterField label="Vai trò">
      <FilterSelect
        value={value}
        onChange={onChange}
        options={[
          { value: '', label: 'Tất cả vai trò' },
          { value: 'student', label: 'Học viên' },
          { value: 'instructor', label: 'Giảng viên' },
          { value: 'admin', label: 'Admin' },
        ]}
      />
    </FilterField>
  );
}

export function UserStatusFilterSelect({
  value,
  onChange,
}: {
  value: UserStatusFilter;
  onChange: (value: UserStatusFilter) => void;
}) {
  return (
    <FilterField label="Tài khoản">
      <FilterSelect
        value={value}
        onChange={(v) => onChange(v as UserStatusFilter)}
        options={[
          { value: '', label: 'Tất cả' },
          { value: 'active', label: 'Hoạt động' },
          { value: 'banned', label: 'Đã cấm' },
          { value: 'suspended', label: 'Tạm khóa' },
        ]}
      />
    </FilterField>
  );
}

export function SourceLessonFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterField label="Lesson ID">
      <Input
        className="h-9 w-24"
        type="text"
        placeholder="UUID"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FilterField>
  );
}
