/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  },
}

export default nextConfig