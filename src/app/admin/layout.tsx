import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow access to login page without authentication
  // The login page handles its own layout

  return (
    <div className="flex min-h-screen">
      {session?.user && <AdminSidebar user={session.user} />}
      <main className={session?.user ? "flex-1 p-6 lg:p-8" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}
