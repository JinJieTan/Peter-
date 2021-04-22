import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import vitePluginImp from "vite-plugin-imp";
import path from "path";
import legacy from "@vitejs/plugin-legacy";
export default defineConfig({
  plugins: [
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style(name) {
            if (/CompWithoutStyleFile/i.test(name)) {
              return false;
            }
            return `antd/es/${name}/style/index.css`;
          },
        },
      ],
    }),
    reactRefresh(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@c": path.resolve(__dirname, "./src/components"),
      "@s": path.resolve(__dirname, "./src/service"),
      "@m": path.resolve(__dirname, "./src/model"),
    },
  },
  server: {
    proxy: {
      // 如果是 /api 打头，则访问地址如下
      "/api": "http://127.0.0.1:8888",
    },
    hmr: {
      host: "localhost",
    },
  },
});
