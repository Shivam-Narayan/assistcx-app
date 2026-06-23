import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/docs",
});

// Export the final Next.js config with Nextra included
/** @type {import('next').NextConfig} */
export default withNextra({
  output: "standalone",
  typescript: {
    // react-hook-form types are incompatible with strict mode in this version
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://teams.microsoft.com https://*.teams.microsoft.com https://*.skype.com https://*.office.com https://*.microsoft.com https://*.cloud.microsoft",
          },
        ],
      },
    ];
  },
});
