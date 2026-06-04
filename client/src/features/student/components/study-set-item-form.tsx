import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  STUDY_SET_CONTENT_LABELS,
  type StudySetContentType,
  type StudySetItemInput,
} from '../types/study-set.types';

export function emptyItem(type: StudySetContentType): StudySetItemInput {
  switch (type) {
    case 'vocabulary':
      return {
        contentType: 'vocabulary',
        content: { word: '', meaning: '', reading: '' },
      };
    case 'grammar':
      return {
        contentType: 'grammar',
        content: { title: '', pattern: '', meaningVi: '', examples: [] },
      };
    case 'kanji':
      return {
        contentType: 'kanji',
        content: { character: '', meaning: '', readingsOn: [], readingsKun: [], examples: [] },
      };
    case 'listening':
      return { contentType: 'listening', content: { title: '', audioUrl: '' } };
    case 'speaking':
      return { contentType: 'speaking', content: { title: '', prompt: '' } };
  }
}

export function StudySetItemForm({
  item,
  index,
  onChange,
  onRemove,
  onUploadAudio,
  uploading,
}: {
  item: StudySetItemInput;
  index: number;
  onChange: (next: StudySetItemInput) => void;
  onRemove: () => void;
  onUploadAudio?: (file: File) => Promise<string>;
  uploading?: boolean;
}) {
  const c = item.content as Record<string, unknown>;

  function setField(key: string, value: unknown) {
    onChange({ ...item, content: { ...c, [key]: value } as StudySetItemInput['content'] });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">
          Mục {index + 1} · {STUDY_SET_CONTENT_LABELS[item.contentType]}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      {item.contentType === 'vocabulary' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Từ</label>
            <Input value={String(c.word ?? '')} onChange={(e) => setField('word', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Đọc</label>
            <Input
              value={String(c.reading ?? '')}
              onChange={(e) => setField('reading', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Nghĩa</label>
            <Input
              value={String(c.meaning ?? '')}
              onChange={(e) => setField('meaning', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Ví dụ (JP)</label>
            <Input
              value={String(c.exampleSentence ?? '')}
              onChange={(e) => setField('exampleSentence', e.target.value)}
            />
          </div>
        </div>
      )}

      {item.contentType === 'grammar' && (
        <div className="grid gap-3">
          <Input
            placeholder="Tiêu đề"
            value={String(c.title ?? '')}
            onChange={(e) => setField('title', e.target.value)}
          />
          <Input
            placeholder="Mẫu câu"
            value={String(c.pattern ?? '')}
            onChange={(e) => setField('pattern', e.target.value)}
          />
          <Input
            placeholder="Nghĩa tiếng Việt"
            value={String(c.meaningVi ?? '')}
            onChange={(e) => setField('meaningVi', e.target.value)}
          />
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ví dụ JP|VI (mỗi dòng: câu JP | dịch)"
            rows={3}
            onChange={(e) => {
              const examples = e.target.value
                .split('\n')
                .filter(Boolean)
                .map((line) => {
                  const [jp, vi] = line.split('|').map((s) => s.trim());
                  return { jp: jp ?? '', vi: vi ?? '' };
                });
              setField('examples', examples);
            }}
          />
        </div>
      )}

      {item.contentType === 'kanji' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Chữ kanji"
            value={String(c.character ?? '')}
            onChange={(e) => setField('character', e.target.value)}
          />
          <Input
            placeholder="Nghĩa"
            value={String(c.meaning ?? '')}
            onChange={(e) => setField('meaning', e.target.value)}
          />
          <Input
            placeholder="Âm On (phẩy)"
            value={(c.readingsOn as string[] | undefined)?.join(', ') ?? ''}
            onChange={(e) =>
              setField(
                'readingsOn',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
          <Input
            placeholder="Âm Kun (phẩy)"
            value={(c.readingsKun as string[] | undefined)?.join(', ') ?? ''}
            onChange={(e) =>
              setField(
                'readingsKun',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </div>
      )}

      {(item.contentType === 'listening' || item.contentType === 'speaking') && (
        <div className="grid gap-3">
          <Input
            placeholder="Tiêu đề"
            value={String(c.title ?? '')}
            onChange={(e) => setField('title', e.target.value)}
          />
          {item.contentType === 'speaking' && (
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Prompt / chủ đề luyện nói"
              value={String(c.prompt ?? '')}
              onChange={(e) => setField('prompt', e.target.value)}
            />
          )}
          {item.contentType === 'listening' && (
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Transcript (tuỳ chọn)"
              value={String(c.transcript ?? '')}
              onChange={(e) => setField('transcript', e.target.value)}
            />
          )}
          {onUploadAudio && (
            <div>
              <label className="text-sm font-medium">File audio</label>
              <Input
                type="file"
                accept="audio/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await onUploadAudio(file);
                  setField('audioUrl', url);
                }}
              />
              {Boolean(c.audioUrl) && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {String(c.audioUrl)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudySetItemTypePicker({
  value,
  onChange,
}: {
  value: StudySetContentType;
  onChange: (t: StudySetContentType) => void;
}) {
  return (
    <select
      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as StudySetContentType)}
    >
      {(Object.keys(STUDY_SET_CONTENT_LABELS) as StudySetContentType[]).map((t) => (
        <option key={t} value={t}>
          {STUDY_SET_CONTENT_LABELS[t]}
        </option>
      ))}
    </select>
  );
}
