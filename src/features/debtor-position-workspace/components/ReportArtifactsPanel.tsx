import { FileText, Globe } from 'lucide-react';
import { DebtorArtifacts } from '../types/debtorWorkspace';

interface ReportArtifactsPanelProps {
  artifacts: DebtorArtifacts;
}

interface ArtifactRowProps {
  icon: 'file' | 'globe';
  label: string;
  path: string | undefined;
}

function ArtifactRow({ icon, label, path }: ArtifactRowProps) {
  if (!path) return null;
  const Icon = icon === 'file' ? FileText : Globe;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <Icon size={14} className="mt-0.5 text-text-secondary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-text-primary">{label}</p>
        <p className="text-[11px] font-mono text-text-secondary break-all">{path}</p>
      </div>
    </div>
  );
}

export function ReportArtifactsPanel({ artifacts }: ReportArtifactsPanelProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-5">Report Artifacts</h2>

      <div className="mb-6">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3 pb-1 border-b border-border">
          Internal Audit View
        </h3>
        <div>
          <ArtifactRow icon="file" label="Statement (MD)" path={artifacts.statementMarkdown} />
          <ArtifactRow icon="file" label="Baseline (MD)" path={artifacts.baselineMarkdown} />
          <ArtifactRow icon="globe" label="Full HTML" path={artifacts.defaultHtml} />
          <ArtifactRow icon="globe" label="Internal HTML" path={artifacts.internalHtml} />
          {artifacts.exportFile && (
            <ArtifactRow icon="file" label="Export File" path={artifacts.exportFile} />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3 pb-1 border-b border-border">
          Customer View
        </h3>
        <div>
          <ArtifactRow icon="globe" label="Customer HTML" path={artifacts.customerHtml} />
        </div>
        <p className="mt-3 text-[11px] text-text-secondary italic">
          Customer view excludes internal audit disclosures.
        </p>
      </div>
    </div>
  );
}
