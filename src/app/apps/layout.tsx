import AppLayout from '@/components/layout/AppLayout';

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
