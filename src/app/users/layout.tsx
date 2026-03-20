import AppLayout from '@/components/layout/AppLayout';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
