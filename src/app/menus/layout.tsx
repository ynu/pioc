import AppLayout from '@/components/layout/AppLayout';

export default function MenusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
