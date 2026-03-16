import SupportChat from "@/components/SupportChat";

export const metadata = {
  title: "Support — Drapit",
  description: "Krijg hulp bij het installeren en instellen van de Drapit widget.",
};

export default function SupportPage() {
  return <SupportChat apiEndpoint="/api/support-chat" />;
}
