// import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Protected from "@/components/Protected";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
       <div className="dashboard-shell">
        <Sidebar />
        <div className="dashboard-content">
          <main className="p-6 max-w-5xl mx-auto w-full">{children}</main>
        </div>
      </div>
    </Protected>
  );
}


