import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotebookItemNoteEditorProps = {
  note: string | null;
  placeholder?: string;
  onSave: (note: string | null) => Promise<void>;
  className?: string;
};

export function NotebookItemNoteEditor({
  note,
  placeholder = 'Ghi chú cách nhớ, mẹo học, ví dụ riêng…',
  onSave,
  className,
}: NotebookItemNoteEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft.trim() || null);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className={cn('mt-3 rounded-xl border border-dashed border-border bg-muted/20 p-3', className)}>
        {note ? (
          <p className="whitespace-pre-wrap text-left text-sm font-medium leading-relaxed text-foreground/90">
            {note}
          </p>
        ) : (
          <p className="text-left text-sm font-medium text-muted-foreground">{placeholder}</p>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-8 gap-1.5 px-2 text-xs font-bold"
          onClick={() => {
            setDraft(note ?? '');
            setEditing(true);
          }}
        >
          <Pencil className="size-3.5" />
          {note ? 'Sửa ghi chú' : 'Thêm ghi chú'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('mt-3 space-y-2', className)}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          onClick={() => setEditing(false)}
        >
          Hủy
        </Button>
        <Button type="button" size="sm" disabled={saving} onClick={() => void handleSave()}>
          Lưu ghi chú
        </Button>
      </div>
    </div>
  );
}
