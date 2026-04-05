import { walk } from "jsr:@std/fs/walk";

Deno.serve(async (req) => {
  try {
    // Determine the root directory by looking for App.jsx
    let rootDir = ".";
    for await (const entry of walk("/", { maxDepth: 5, exts: [".jsx"] })) {
      if (entry.name === "App.jsx") {
        rootDir = entry.path.replace("/App.jsx", "");
        break;
      }
    }

    const results = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    
    for await (const entry of walk(rootDir, { exts: [".js", ".jsx"] })) {
      if (entry.isFile && !entry.path.includes("node_modules") && !entry.path.includes(".git")) {
        const text = await Deno.readTextFile(entry.path);
        if (text.includes("Top100WomenRail")) {
          results.push({ file: entry.path, reason: "Contains Top100WomenRail" });
        }
        
        // Also check for any syntax errors or bad imports generically
        let match;
        while ((match = importRegex.exec(text)) !== null) {
          const importPath = match[1];
          if (importPath.includes("Top100WomenRail")) {
            results.push({ file: entry.path, reason: "Imports Top100WomenRail" });
          }
        }
      }
    }
    return Response.json({ rootDir, files: results });
  } catch (err) {
    return Response.json({ error: err.message, stack: err.stack });
  }
});