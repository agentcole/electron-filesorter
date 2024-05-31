import type { Configuration } from 'webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  // Essential to make tesseract.js and whisper work with electron

  // TODO: Uncomment for live build
  externals: [nodeExternals()],
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: 'main.js',
  // },
  devtool: 'source-map', // Add this line
};
