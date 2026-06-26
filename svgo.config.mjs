/** @type {import('svgo').Config} */
export default {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: {
            remove: true,
            minify: true,
          },
        },
      },
    },
    "removeDimensions",
    "removeEditorsNSData",
    "removeMetadata",
    "removeComments",
    "removeHiddenElems",
    "removeEmptyContainers",
    "removeUnusedNS",
  ],
};
