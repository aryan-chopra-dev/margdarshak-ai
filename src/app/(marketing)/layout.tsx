import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <ChatWidget />
    </>
  );
}
