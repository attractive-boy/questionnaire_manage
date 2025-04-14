/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@antv/g2plot',
    '@antv/g2',
    '@antv/g-canvas',
    '@antv/util'
  ]
};

module.exports = nextConfig;
