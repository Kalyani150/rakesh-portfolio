// Copies the built admin app into the website build so one deployment serves both:
//   /        -> website
//   /admin   -> admin panel
import { cpSync, rmSync, existsSync } from "node:fs";

const from = "admin/dist";
const to = "website/dist/admin";
if (!existsSync(from)) throw new Error("admin/dist not found - build the admin first");
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log("Merged admin build into " + to);
