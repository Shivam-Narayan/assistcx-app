import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "@/styles/globals.css";
import "@/styles/docs.css";
import Image from "next/image";
import Link from "next/link";
import { SquareArrowOutUpRight, ExternalLink } from "lucide-react";

export const metadata = {
  title: "AssistCX Documentation",
  description: "Complete documentation for AssistCX platform",
};

const navbar = (
  <Navbar
    logo={
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Image src="/icon.svg" alt="AssistCX Icon" width={28} height={28} />
        {/* <Image src="/logo.svg" alt="AssistCX Logo" width={100} height={28} /> */}
        <span className="text-xl font-bold text-foreground/90">AssistCX</span>
        <span className="text-base font-medium text-muted-foreground border rounded-md px-2 py-0">
          Docs
        </span>
      </div>
    }
    logoLink="/docs"
  >
    <Link
      href="/"
      className="flex items-center gap-2 h-8 text-sm font-medium text-white rounded-lg px-3 py-1.5 bg-primary hover:bg-primary/90"
    >
      Home <SquareArrowOutUpRight className="w-4 h-4" />
    </Link>
  </Navbar>
);

// Uncomment to enable footer
// const footer = (
//   <Footer>
//     MIT © {new Date().getFullYear()} AssistCX.
//   </Footer>
// )

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap("/docs");

  return (
    <Layout
      navbar={navbar}
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/your-org/assistcx-docs"
      // footer={footer}  // Uncomment to enable footer
      editLink="Edit this page on GitHub"
      feedback={{ content: "Question? Give us feedback →" }}
    >
      {children}
    </Layout>
  );
}
