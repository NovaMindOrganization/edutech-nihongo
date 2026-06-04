import { Link } from 'react-router-dom';

import { paths } from '@/router/paths';

/** Legacy route — redirects users to the full call experience. */
export function CommunityView() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="font-display text-2xl font-bold">Cộng đồng</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Luyện nói ngẫu nhiên đã chuyển sang trang gọi video.
      </p>
      <Link
        to={paths.student.communityCall}
        className="mt-6 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
      >
        Mở phòng gọi
      </Link>
    </div>
  );
}
