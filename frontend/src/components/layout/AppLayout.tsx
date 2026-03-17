import type { ReactNode } from 'react';
import TopBar from './TopBar';

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[--color-bg]">
      <TopBar />
      <main>{children}</main>
    </div>
  );
}
