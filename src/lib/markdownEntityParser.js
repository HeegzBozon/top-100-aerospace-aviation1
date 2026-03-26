// Parse Markdown files with YAML frontmatter for entity creation
export function parseMarkdownEntity(content) {
  const lines = content.split('\n');
  let frontmatterEnd = -1;
  let frontmatterStart = -1;

  // Find frontmatter boundaries
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (frontmatterStart === -1) frontmatterStart = i;
      else if (frontmatterEnd === -1) {
        frontmatterEnd = i;
        break;
      }
    }
  }

  if (frontmatterStart === -1 || frontmatterEnd === -1) {
    throw new Error('No YAML frontmatter found. Use --- to delimit.');
  }

  const frontmatterText = lines.slice(frontmatterStart + 1, frontmatterEnd).join('\n');
  const bodyText = lines.slice(frontmatterEnd + 1).join('\n').trim();

  // Parse YAML (simple parser for entity data)
  const data = {};
  frontmatterText.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Parse arrays and booleans
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(v => v.trim());
      } else if (value === 'true') {
        data[key] = true;
      } else if (value === 'false') {
        data[key] = false;
      } else {
        data[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
      }
    }
  });

  // Detect entity type
  let entity_type = data.entity_type || null;
  if (!entity_type) {
    if (data.persona_role) entity_type = 'AgentSkill';
    else if (data.input_schema || data.output_schema) entity_type = 'Skill';
    else if (data.team_topology_type) entity_type = 'AgentTeam';
    else if (data.solution_train_id) entity_type = 'AgileReleaseTrain';
    else if (data.art_count !== undefined) entity_type = 'SolutionTrain';
  }

  return {
    entity_type,
    data: { ...data, instructions: bodyText || data.instructions || '' },
    raw: { frontmatter: data, body: bodyText }
  };
}

export const ENTITY_TEMPLATES = {
  AgentSkill: {
    name: 'my-agent',
    display_name: 'My Agent',
    persona_role: 'custom',
    description: 'What this agent does',
    instructions: '# Your full instructions here',
    output_format: 'OUTPUT_PREFIX: [ACTION]',
    is_active: true,
    tdd_enforced: false,
    version: '1.0.0',
  },
  Skill: {
    name: 'MySkill',
    display_name: 'My Skill',
    description: 'What this skill enables',
    instructions: 'How to use this skill',
    input_schema: {},
    output_schema: {},
    is_active: true,
    version: '1.0.0',
  },
  AgentTeam: {
    name: 'Team Name',
    description: 'Team purpose',
    art_id: '',
    team_topology_type: 'stream_aligned',
    is_active: true,
  },
  AgileReleaseTrain: {
    name: 'ART Name',
    description: 'Value stream',
    program_increment_id: '',
    is_active: true,
  },
  SolutionTrain: {
    name: 'Solution Name',
    description: 'Vision for large-scale solution',
    vision: 'Extended vision statement',
    is_active: true,
  },
};