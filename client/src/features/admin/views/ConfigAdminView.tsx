import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getSystemConfig, setSystemConfig } from '../services/systemAdminApi';

export function ConfigAdminView() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [threshold, setThreshold] = useState('70');

  useEffect(() => {
    getSystemConfig()
      .then((c) => {
        setConfig(c);
        setThreshold(c.default_pass_threshold ?? '70');
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, []);

  async function saveThreshold() {
    try {
      await setSystemConfig('default_pass_threshold', threshold);
      toast.success('Đã lưu');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Cấu hình hệ thống</h1>
      <div className="mt-6 max-w-md space-y-4">
        <label className="text-sm font-medium">MiniTest pass threshold (%)</label>
        <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        <Button onClick={saveThreshold}>Lưu</Button>
        <pre className="mt-8 overflow-auto rounded-lg bg-muted p-4 text-xs">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}
