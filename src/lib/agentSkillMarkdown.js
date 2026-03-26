/**
 * Markdown utility for AgentSkill YAML frontmatter serialization/deserialization
 * Format: YAML frontmatter + markdown instructions body
 */

export function skillToMarkdown(skill) {
  const frontmatter = {
    name: skill.name,
    display_name: skill.display_name,
    persona_role: skill.persona_role,
    version: skill.version || '1.0.0',
    is_active: skill.is_active !== false,
    tdd_enforced: skill.tdd_enforced || false,
    output_format: skill.output_format || '',
    tags: skill.tags || [],
  };

  const yamlLines = [
    '---',
    ...Object.entries(frontmatter).map(([key, val]) => {
      if (Array.isArray(val)) {
        return `${key}: [${val.map(v => `"${v}"`).join(', ')}]`;
      }
      if (typeof val === 'string') {
        return `${key}: "${val.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${val}`;
    }),
    '---',
    '',
    '# Instructions',
    '',
    skill.instructions || '',
  ];

  return yamlLines.join('\n');
}

export function markdownToSkill(markdown) {
  const lines = markdown.split('\n');

  // Find frontmatter boundaries
  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (startIdx === -1) startIdx = i;
      else {
        endIdx = i;
        break;
      }
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Invalid markdown: missing YAML frontmatter boundaries (---)');
  }

  // Parse frontmatter
  const frontmatterLines = lines.slice(startIdx + 1, endIdx);
  const frontmatter = {};

  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (!match) continue;

    const [, key, value] = match;
    const trimmedValue = value.trim();

    // Parse different types
    if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
      // Array: ["a", "b"] -> [a, b]
      frontmatter[key] = trimmedValue
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^"|"$/g, ''));
    } else if (trimmedValue === 'true') {
      frontmatter[key] = true;
    } else if (trimmedValue === 'false') {
      frontmatter[key] = false;
    } else if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
      // String
      frontmatter[key] = trimmedValue.slice(1, -1).replace(/\\"/g, '"');
    } else {
      frontmatter[key] = trimmedValue;
    }
  }

  // Extract instructions body (after second ---)
  const instructionsBody = lines.slice(endIdx + 1).join('\n').trim();
  const instructions = instructionsBody.replace(/^#\s*Instructions\s*\n/, '').trim();

  // Validate required fields
  if (!frontmatter.name || !frontmatter.display_name) {
    throw new Error('Invalid markdown: missing required fields (name, display_name)');
  }

  return {
    name: frontmatter.name,
    display_name: frontmatter.display_name,
    persona_role: frontmatter.persona_role || 'custom',
    version: frontmatter.version || '1.0.0',
    is_active: frontmatter.is_active !== false,
    tdd_enforced: frontmatter.tdd_enforced || false,
    output_format: frontmatter.output_format || '',
    tags: frontmatter.tags || [],
    instructions,
  };
}

export function downloadMarkdown(markdown, filename = 'agent-skill.md') {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}