/** @type {import('next').NextConfig} */

const nextConfig = {};

if (process.env.NEXT_PUBLIC_TEMPO) {
    nextConfig["experimental"] = {
        // NextJS 13.4.8 up to 14.1.3:
        // swcPlugins: [[require.resolve("tempo-devtools/swc/0.86"), {}]],
        // NextJS 14.1.3 to 14.2.11:
        // swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]

        // NextJS 15+:
        // Temporarily commenting out tempo-devtools SWC plugin as we need to verify compatibility with Next.js 15
        // If you encounter issues, please check for tempo-devtools updates or documentation
    }
}

module.exports = nextConfig;
