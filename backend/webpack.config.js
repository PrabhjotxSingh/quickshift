const path = require("path");
const nodeExternals = require("webpack-node-externals");
const slsw = require("serverless-webpack");

module.exports = {
	// Use the Serverless Webpack entry points
	entry: slsw.lib.entries,
	mode: process.env.NODE_ENV || "production",
	target: "node",

	// Exclude node_modules except for the shared package (which is allowlisted)
	externals: [
		nodeExternals({
			allowlist: ["shared"], // This tells webpack to bundle the "shared" package
		}),
	],

	// Configure ts-loader for TypeScript files
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
				options: {
					transpileOnly: true,
				},
			},
		],
	},

	resolve: {
		extensions: [".ts", ".js"],
	},

	// Output bundled files into the .webpack folder
	output: {
		libraryTarget: "commonjs",
		path: path.join(__dirname, ".webpack"),
		filename: "[name].js",
	},

	devtool: "source-map",
};
