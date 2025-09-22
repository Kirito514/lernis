/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'edunft.io'],
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_MUMBAI_RPC: process.env.NEXT_PUBLIC_MUMBAI_RPC,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  },
};

module.exports = nextConfig;
