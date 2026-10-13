import { Info } from 'lucide-react';

interface Props {
  url: string;
  label?: string;
}

export function InfoTooltip({ url, label = "Plus d'informations" }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="inline-flex items-center justify-center rounded-full text-slate-400 transition-all hover:text-teal-600 hover:bg-teal-50"
    >
      <Info size={15} />
    </a>
  );
}
