import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto w-full">{children}</main>
    </Protected>
  );
}


