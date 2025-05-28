const path = require('path');
const bundleConfig = require('o:/MeadCo/Dev/ScriptX.Print.Client/configs/distbundlesconfig.json');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Generate a webpack config for each bundle in distbundlesconfig.json
module.exports = bundleConfig.map(bundle => {
    // Extract the output filename and directory
    const outputPath = path.dirname(bundle.outputFileName);
    const outputFilename = path.basename(bundle.outputFileName);

    return {
        mode: 'production',
        entry: bundle.inputFiles,
        output: {
            path: path.resolve(__dirname, outputPath),
            filename: outputFilename
        },
        devtool: 'source-map',
        optimization: {
            minimize: true
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: [],
                cleanAfterEveryBuildPatterns: ['webpack-entries']
            })
        ]
    };
});
