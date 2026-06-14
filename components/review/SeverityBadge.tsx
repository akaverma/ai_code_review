import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_CONFIG } from "@/lib/constants";
import type { Severity } from "@/types";

const SEVERITY_ICONS: Record<Severity, typeof ShieldAlert> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = SEVERITY_ICONS[severity];

  return (
    <Badge variant={severity} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
