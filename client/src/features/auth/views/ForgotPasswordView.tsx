import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { AuthCard, AuthField } from '../components/auth-card';
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
    <AuthCard
      title="Quên mật khẩu?"
      description="Không sao cả. Nhập email và chúng tôi sẽ gửi một đường dẫn để bạn quay lại lộ trình."
      accent="warning"
      footer={
        <Link to={paths.login} className="font-extrabold text-primary hover:underline">
          ← Quay lại đăng nhập
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email" hint="Dùng email bạn đã đăng ký tài khoản NIHONGOCOACH.">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </AuthField>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}
        </Button>
      </form>
      {devUrl && (
        <p className="mt-5 break-all rounded-lg border border-border bg-muted p-3 text-xs font-medium text-muted-foreground shadow-sm">
          Dev:{' '}
          <Link to={devUrl.replace(/^https?:\/\/[^/]+/, '')} className="font-bold text-primary">
            {devUrl}
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
