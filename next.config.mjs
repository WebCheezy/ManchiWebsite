/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!backendUrl) {
      return []
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
    ]
  },
}

export default nextConfig
