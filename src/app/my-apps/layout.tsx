import AppLayout from '@/components/layout/AppLayout';

export default function MyAppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
