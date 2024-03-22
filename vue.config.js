const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: 'src/assets/icon.png',
        },
        nsis: {
          oneClick: false, // User must click through the installer
          allowToChangeInstallationDirectory: true, // Allow user to select install location
          perMachine: true, // Install for all users (requires elevation)
          // Include other NSIS options as needed
        },
      }
    }
    }
})
