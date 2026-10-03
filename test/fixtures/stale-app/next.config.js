module.exports = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/products/:id",
        headers: [{ key: "Cache-Control", value: "s-maxage=86400" }],
      },
    ];
  },
};
