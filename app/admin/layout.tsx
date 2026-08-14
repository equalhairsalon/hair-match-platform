import { AdminShell } from '@/components/AdminShell';
import { requireAdmin } from '@/lib/admin';
export default async function AdminLayout({children}:{children:React.ReactNode}){const admin=await requireAdmin();return <AdminShell adminLevel={admin.adminLevel}>{children}</AdminShell>}
