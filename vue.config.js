const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: 'src/assets/icon.png',
          FontFace: 'src/assets/fonts/digital-7.ttf'
        }
      }
    }
    }
})
