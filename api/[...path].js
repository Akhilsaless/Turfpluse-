// Build the Express backend into one ESM module so Node never resolves
// extensionless TypeScript imports as directories in the deployed function.
export { default } from "../server-build/runtime.mjs";
