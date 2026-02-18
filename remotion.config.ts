import { Config } from "@remotion/cli/config";
import path from "path";

Config.setEntryPoint("./src/remotion/Root.tsx");

Config.overrideWebpackConfig((currentConfiguration) => {
  const config = { ...currentConfiguration };
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    "@": path.join(process.cwd(), "src"),
  };
  return config;
});
