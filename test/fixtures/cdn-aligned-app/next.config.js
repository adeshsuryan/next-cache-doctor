module.exports = {
  async headers() {
    return [
      {
        source: "/status",
        headers: [{ key: "Cache-Control", value: "s-maxage=60" }],
      },
    ];
  },
};
