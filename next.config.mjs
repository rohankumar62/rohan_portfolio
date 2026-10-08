export default { ...(process.env.STATIC_EXPORT === "1" ? {output: "export"} : {}), images: {unoptimized: true}, devIndicators: false };
