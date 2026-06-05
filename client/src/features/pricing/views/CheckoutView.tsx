import { CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppHeader } from '@/components/usable/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

import { getOrder } from '../services/pricingApi';
import type { CheckoutOrder } from '../types/pricing.types';

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function useCountdown(expiresAt: string | null, active: boolean) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!expiresAt || !active) return;
    const tick = () => {
      setRemainingMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, active]);

  const label = useMemo(() => {
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [remainingMs]);

  return { remainingMs, label };
}

export function CheckoutView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const isPending = order?.status === 'pending';
  const { label: countdownLabel, remainingMs } = useCountdown(
    order?.expiresAt ?? null,
    Boolean(isPending),
  );

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function load() {
      if (!orderId) return;
      try {
        const data = await getOrder(orderId);
        if (cancelled) return;
        setOrder(data);
        if (data.status === 'paid') {
          toast.success('Thanh toán thành công — đã mở khóa học');
          window.setTimeout(() => navigate(paths.learn.hub), 2000);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Không tải được đơn hàng');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const poll = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [orderId, navigate]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.message(`Đã copy ${label}`);
  }

  if (loading && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full px-4 py-16 text-center md:px-8">
        <p>Không tìm thấy đơn hàng.</p>
        <Link to={paths.pricing}>
          <Button className="mt-4">Quay lại bảng giá</Button>
        </Link>
      </div>
    );
  }

  if (order.status === 'paid') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="flex w-full flex-col items-center px-4 py-20 text-center md:px-8">
          <CheckCircle2 className="size-16 text-primary" />
          <h1 className="font-display mt-4 text-2xl font-bold">Thanh toán thành công</h1>
          <p className="mt-2 text-muted-foreground">
            Gói <strong>{order.planName}</strong> đã được kích hoạt.
          </p>
          <Link to={paths.learn.hub} className="mt-8">
            <Button size="lg">Vào học ngay</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (order.status === 'expired' || (isPending && remainingMs <= 0)) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="w-full px-4 py-16 text-center md:px-8">
          <h1 className="font-display text-2xl font-bold">Đơn hàng đã hết hạn</h1>
          <p className="mt-2 text-muted-foreground">
            Vui lòng tạo đơn mới để tiếp tục thanh toán.
          </p>
          <Link to={paths.pricing} className="mt-6 inline-block">
            <Button>Tạo đơn mới</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="w-full px-4 py-10 md:px-8 lg:max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Thanh toán — {order.planName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Chuyển khoản đúng số tiền và nội dung. Hệ thống tự xác nhận qua SePAY.
            </p>
            {isPending && (
              <p className="text-sm font-medium text-amber-600">
                Hết hạn sau: {countdownLabel}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <img
                src={order.qrUrl}
                alt="Mã QR chuyển khoản"
                className="max-h-72 rounded-lg border border-border"
              />
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Ngân hàng</dt>
                <dd className="font-medium">{order.bankName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Số tài khoản</dt>
                <dd className="flex items-center gap-2 font-mono font-medium">
                  {order.bankAccount}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyText(order.bankAccount, 'số tài khoản')}
                  >
                    <Copy className="size-4" />
                  </Button>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Chủ tài khoản</dt>
                <dd className="font-medium">{order.accountName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Số tiền</dt>
                <dd className="font-display text-lg font-bold text-primary">
                  {formatVnd(order.amount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Nội dung CK</dt>
                <dd className="flex items-center gap-2 font-mono font-semibold text-primary">
                  {order.paymentCode}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyText(order.paymentCode, 'nội dung')}
                  >
                    <Copy className="size-4" />
                  </Button>
                </dd>
              </div>
            </dl>

            <p className="rounded-lg bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
              Sau khi chuyển khoản, trang sẽ tự cập nhật trong vài giây. Giữ nguyên nội dung{' '}
              <strong>{order.paymentCode}</strong> khi chuyển tiền.
            </p>

            {isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Đang chờ xác nhận thanh toán…
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
