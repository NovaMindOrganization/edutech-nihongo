import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { AuthCard, AuthField } from '../components/auth-card';
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
      <AuthCard
        title="Liên kết không hợp lệ"
        description="Đường dẫn đặt lại mật khẩu đã thiếu token hoặc không còn dùng được."
        accent="brand"
        footer={
          <Link to={paths.forgotPassword} className="font-extrabold text-primary hover:underline">
            Yêu cầu liên kết mới
          </Link>
        }
      >
        <div className="rounded-lg border border-border bg-muted p-4 text-sm font-medium text-muted-foreground shadow-sm">
          Hãy yêu cầu lại email đặt mật khẩu để tiếp tục.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      description="Chọn mật khẩu mới để quay lại bài học, flashcard và tiến độ JLPT của bạn."
      accent="success"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Mật khẩu mới" hint="Tối thiểu 8 ký tự.">
          <Input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </AuthField>
        <AuthField label="Xác nhận mật khẩu">
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </AuthField>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
        </Button>
      </form>
    </AuthCard>
  );
}
