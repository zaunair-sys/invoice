import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";

export const metadata = {
  title: "PromptToInvoice — AI Invoicing, Simplified",
  description:
    "Turn a simple prompt into a polished, professional invoice in seconds. Built for freelancers and teams across the US and Europe.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
