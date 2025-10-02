import fs from 'fs/promises';
import path from 'path';

import {
  deepResearch,
  writeFinalAnswer,
  writeFinalReport,
  type ResearchProgress as ResearchProgressType,
} from '../tools/deep-research/src/deep-research';

type ResearchProgress = ResearchProgressType;

interface CliArgs {
  query: string;
  breadth: number;
  depth: number;
  mode: 'report' | 'answer';
  output?: string;
  verbose: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;

    const key = current.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key] = 'true';
    } else {
      args[key] = value;
      i += 1;
    }
  }

  const query = args.query ?? args.topic;
  if (!query) {
    throw new Error('Missing required --query argument');
  }

  return {
    query,
    breadth: Number(args.breadth ?? 4),
    depth: Number(args.depth ?? 2),
    mode: (args.mode === 'answer' ? 'answer' : 'report') as CliArgs['mode'],
    output: args.output,
    verbose: args.verbose === 'true',
  };
}

function buildPrompt(baseQuery: string): string {
  return `Research Objective: Identify crypto tokens credibly accused of being scams where victims report losing funds.\n\nPrimary Question: ${baseQuery}\n\nEvidence Requirements:\n- Prioritize first-hand loss reports, regulatory actions, or on-chain analyses proving investor losses.\n- Capture specific details: token name/symbol, project claims, alleged scam pattern (rug pull, Ponzi, phishing, etc.), loss magnitude (if stated), and affected communities.\n- Include source URLs for every claim.\n\nOutput Expectations:\n- Structure findings so they can be converted into newsletter bullets.\n- Flag high-urgency items (recent events < 14 days) and recurring scams.\n- Note when evidence is anecdotal vs. confirmed by multiple sources.\n`;
}

function logProgress(progress: ResearchProgress) {
  const { currentDepth, totalDepth, completedQueries, totalQueries, currentQuery } = progress;
  const depthStatus = `${totalDepth - currentDepth}/${totalDepth}`;
  const queryStatus = `${completedQueries}/${totalQueries}`;
  console.log(`[deep-research] depth ${depthStatus} | queries ${queryStatus} | current: ${currentQuery ?? 'n/a'}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = buildPrompt(args.query);

  console.log('[deep-research] starting run');

  const { learnings, visitedUrls } = await deepResearch({
    query: prompt,
    breadth: args.breadth,
    depth: args.depth,
    onProgress: args.verbose ? logProgress : undefined,
  });

  if (!learnings.length) {
    console.warn('[deep-research] no learnings returned');
  }

  const outputText = await (args.mode === 'answer'
    ? writeFinalAnswer({ prompt, learnings })
    : writeFinalReport({
        prompt,
        learnings,
        visitedUrls,
      }));

  if (args.output) {
    const outputPath = path.resolve(args.output);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, outputText, 'utf-8');
    console.log(`[deep-research] ${args.mode} written to ${outputPath}`);
  } else {
    console.log(outputText);
  }

  if (args.verbose) {
    console.log('[deep-research] visited URLs');
    visitedUrls.forEach(url => console.log(` - ${url}`));
  }
}

main().catch(error => {
  console.error('[deep-research] run failed', error);
  process.exitCode = 1;
});
