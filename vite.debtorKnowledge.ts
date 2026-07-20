import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

function knowledgeFilePath(root: string, urlPath: string): string | null {
  const match = urlPath.match(/^\/([^/]+)\/knowledge-bundle\.json$/);
  if (!match) return null;
  return path.join(root, 'analysis/debtors', match[1], 'data/knowledge-bundle.json');
}

function serveDebtorKnowledge(root: string) {
  return (req: { url?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void }, next: () => void) => {
    const urlPath = (req.url ?? '').split('?')[0];
    const filePath = knowledgeFilePath(root, urlPath);
    if (!filePath || !fs.existsSync(filePath)) {
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    fs.createReadStream(filePath).pipe(res as unknown as NodeJS.WritableStream);
  };
}

export function debtorKnowledgePlugin(): Plugin {
  const root = process.cwd();

  return {
    name: 'debtor-knowledge',
    configureServer(server) {
      server.middlewares.use('/debtor-knowledge', serveDebtorKnowledge(root));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/debtor-knowledge', serveDebtorKnowledge(root));
    },
    generateBundle() {
      const debtorsDir = path.join(root, 'analysis/debtors');
      if (!fs.existsSync(debtorsDir)) return;

      for (const code of fs.readdirSync(debtorsDir)) {
        const bundlePath = path.join(debtorsDir, code, 'data/knowledge-bundle.json');
        if (!fs.existsSync(bundlePath)) continue;
        this.emitFile({
          type: 'asset',
          fileName: `debtor-knowledge/${code}/knowledge-bundle.json`,
          source: fs.readFileSync(bundlePath),
        });
      }
    },
  };
}
