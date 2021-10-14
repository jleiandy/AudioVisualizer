module.exports = {
  reactStrictMode: true,
  webpack(config, options) {
    const { isServer } = options
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            name: '[name]-[hash].[ext]',
          },
        },
      ],
    })
    return config
  },
}
