import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { forgotPassword } from '../services/authApi';

export function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      toast.success(data.message);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được yêu cầu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-xl">
      <h1 className="font-display text-xl font-bold">Quên mật khẩu</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}
        </Button>
      </form>
      {devUrl && (
        <p className="mt-4 break-all text-xs text-muted-foreground">
          Dev: <Link to={devUrl.replace(/^https?:\/\/[^/]+/, '')} className="text-primary">{devUrl}</Link>
        </p>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to={paths.login} className="text-primary hover:underline">
          ← Đăng nhập
        </Link>
      </p>
    </div>
  );
}
