import path from 'node:path';
import type { NextConfig } from 'next';
const nextConfig:NextConfig={output:process.env.STANDALONE==='true'?'standalone':undefined,outputFileTracingRoot:path.join(__dirname,'../..'),images:{remotePatterns:[{protocol:'https',hostname:'images.unsplash.com'}]}};export default nextConfig;
