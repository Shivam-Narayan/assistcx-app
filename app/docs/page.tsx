import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function DocsIndexPage() {
  const popularGuides = [
    {
      title: 'Getting Started',
      description: 'What AssistCX is and how it helps you',
      href: '/docs/documentation/getting-started'
    },
    {
      title: 'Quick Start',
      description: 'Get running in minutes',
      href: '/docs/guides/quick-start'
    },
    {
      title: 'Create Invoice',
      description: 'Send professional invoices',
      href: '/docs/guides/recipes'
    },
    {
      title: 'Connect Bank',
      description: 'Link your accounts securely',
      href: '/docs/guides'
    },
    {
      title: 'Receipt Matching',
      description: 'AI-powered matching workflow',
      href: '/docs/guides'
    },
    {
      title: 'Understanding Metrics',
      description: 'How your numbers work',
      href: '/docs/documentation'
    }
  ]

  const browseTopics = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', href: '/docs/documentation' },
        { title: 'Quick Start', href: '/docs/guides/quick-start' },
        { title: 'Desktop App', href: '/docs/documentation' },
        { title: 'Troubleshooting', href: '/docs/documentation/troubleshooting' }
      ]
    },
    {
      title: 'Banking',
      items: [
        { title: 'Connect Bank', href: '/docs/guides' },
        { title: 'Categorization', href: '/docs/documentation' },
        { title: 'Multi-Currency', href: '/docs/documentation' },
        { title: 'Categories Reference', href: '/docs/documentation' }
      ]
    },
    {
      title: 'Inbox & Vault',
      items: [
        { title: 'Receipt Matching', href: '/docs/guides' },
        { title: 'Connect Gmail', href: '/docs/guides' },
        { title: 'Connect Slack', href: '/docs/guides' },
        { title: 'File Storage', href: '/docs/guides' }
      ]
    },
    {
      title: 'Invoicing',
      items: [
        { title: 'Create Invoice', href: '/docs/guides/recipes' },
        { title: 'Recurring Invoices', href: '/docs/guides' },
        { title: 'Accept Payments', href: '/docs/guides' },
        { title: 'Invoice Settings', href: '/docs/documentation' }
      ]
    },
    {
      title: 'Time Tracking',
      items: [
        { title: 'Create Project', href: '/docs/guides' },
        { title: 'Track Time', href: '/docs/guides' },
        { title: 'Invoice Time', href: '/docs/guides' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { title: 'Understanding Metrics', href: '/docs/documentation' },
        { title: 'Revenue & Profit', href: '/docs/documentation' },
        { title: 'Burn Rate', href: '/docs/documentation' },
        { title: 'Runway', href: '/docs/documentation' }
      ]
    },
    {
      title: 'Integrations',
      items: [
        { title: 'Apps Overview', href: '/docs/guides' },
        { title: 'Xero', href: '/docs/guides' },
        { title: 'QuickBooks', href: '/docs/guides' },
        { title: 'Fortnox', href: '/docs/guides' }
      ]
    },
    {
      title: 'Assistant',
      items: [
        { title: 'Using Assistant', href: '/docs/guides' },
        { title: 'AI Tools (MCP)', href: '/docs/guides' }
      ]
    },
    {
      title: 'Developer',
      items: [
        { title: 'API Reference', href: '/docs/documentation' },
        { title: 'Build OAuth Apps', href: '/docs/documentation' },
        { title: 'OAuth Scopes', href: '/docs/documentation' },
        { title: 'App Review', href: '/docs/documentation' }
      ]
    }
  ]

  const adminTopics = [
    {
      title: 'User & Role Management',
      description: 'Invite teammates, assign roles, and manage access.',
      href: '/docs/documentation'
    },
    {
      title: 'Workspace Settings',
      description: 'Configure branding, preferences, and defaults.',
      href: '/docs/documentation'
    },
    {
      title: 'Audit & Security',
      description: 'Review activity logs and security controls.',
      href: '/docs/documentation'
    }
  ]

  return (
    <>
      <div className="container mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          DOCUMENTATION
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          How can we help?
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Learn how to build smarter workflows, onboard your team, and get the
          most out of AssistCX.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/documentation"
            className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Start with Documentation
          </Link>
          <Link
            href="/docs/guides"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse Guides
          </Link>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            POPULAR GUIDES
          </h2>
          <Link
            href="/docs/guides"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {popularGuides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                {guide.title}
                </h3>
                <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          ASSISTCX ADMINISTRATION
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {adminTopics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="group rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                  {topic.title}
                </h3>
                <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {topic.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          BROWSE BY TOPIC
        </h2>
        <div className="mt-6 grid gap-10 md:grid-cols-3">
          {browseTopics.map((topic) => (
            <div key={topic.title}>
              <h3 className="text-base font-semibold text-foreground">
                {topic.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {topic.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
      <footer className="mt-16 bg-muted py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AssistCX. All rights reserved.
        </p>
      </footer>
    </>
  )
}
