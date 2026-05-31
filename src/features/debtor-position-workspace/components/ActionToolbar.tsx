import { RefreshCw, Bot, ShieldCheck, UserCheck, Download, Send, Flag } from 'lucide-react';

const SUBTITLE = 'Execution delegated to agent/script workflow.';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={SUBTITLE}
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border/80 transition-colors text-center min-w-[90px]"
    >
      <span className="w-4 h-4">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      <span className="text-[9px] text-text-secondary/60 leading-tight">{SUBTITLE}</span>
    </button>
  );
}

export function ActionToolbar() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Actions</h2>
      <div className="flex flex-wrap gap-3">
        <ToolbarButton icon={<RefreshCw size={16} />} label="Regenerate" onClick={() => console.log('Regenerate')} />
        <ToolbarButton icon={<Bot size={16} />} label="Agent Review" onClick={() => console.log('Request Agent Review')} />
        <ToolbarButton icon={<ShieldCheck size={16} />} label="Approve Internal" onClick={() => console.log('Approve Internal')} />
        <ToolbarButton icon={<UserCheck size={16} />} label="Approve Customer" onClick={() => console.log('Approve Customer')} />
        <ToolbarButton icon={<Download size={16} />} label="Export" onClick={() => console.log('Export')} />
        <ToolbarButton icon={<Send size={16} />} label="Mark Sent" onClick={() => console.log('Mark Sent')} />
        <ToolbarButton icon={<Flag size={16} />} label="Flag Exception" onClick={() => console.log('Flag Exception')} />
      </div>
    </div>
  );
}
