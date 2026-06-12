import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { resetPassword } from '../services/authApi';

export function ResetPasswordView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Đã đặt lại mật khẩu');
      navigate(paths.login);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Liên kết không hợp lệ. <Link to={paths.forgotPassword}>Yêu cầu lại</Link>
      </p>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-xl">
      <h1 className="font-display text-xl font-bold">Đặt lại mật khẩu</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="password"
          placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <Input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Đang lưu…' : 'Lưu mật khẩu'}
        </Button>
      </form>
    </div>
  );
}
