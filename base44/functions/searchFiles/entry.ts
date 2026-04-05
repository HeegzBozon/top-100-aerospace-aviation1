import { walk } from "jsr:@std/fs/walk";

Deno.serve(async (req) => {
  try {
    const results = [];
    for await (const entry of walk("/app/src", { exts: [".js", ".jsx"] })) {
      if (entry.isFile && !entry.path.includes("node_modules") && !entry.path.includes(".git")) {
        const text = await Deno.readTextFile(entry.path);
        if (text.includes("Top100WomenRail")) {
          results.push(entry.path);
        }
      }
    }
    return Response.json({ files: results });
  } catch (err) {
    return Response.json({ error: err.message });
  }
});