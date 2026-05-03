import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <ChatWidget />
    </>
  );
}
