import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { AuthCard, AuthField } from '../components/auth-card';
import { register } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { defaultAppPath } from '../utils/auth-routes';

export function RegisterView() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(email, password, displayName || undefined);
      setSession(data.user, data.accessToken);
      toast.success('Đăng ký thành công');
      navigate(defaultAppPath(data.user), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Tạo tài khoản học viên"
      description="Bắt đầu bằng một lộ trình nhỏ, rõ ràng và đủ vui để quay lại mỗi ngày."
      accent="success"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to={paths.login} className="font-extrabold text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      {currentUser && (
        <p className="mb-5 rounded-lg border border-border bg-surface-paper p-3 text-sm font-medium text-foreground shadow-sm">
          Bạn đang đăng nhập <strong>{currentUser.email}</strong>. Đăng ký tài khoản mới sẽ thay thế phiên
          hiện tại.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Tên hiển thị" hint="Bạn có thể đổi tên này trong hồ sơ sau.">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="VD: Minh"
          />
        </AuthField>
        <AuthField label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            required
          />
        </AuthField>
        <AuthField label="Mật khẩu" hint="Tối thiểu 8 ký tự để bảo vệ tiến độ học của bạn.">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </AuthField>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </Button>
      </form>
    </AuthCard>
  );
}
