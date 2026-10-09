import type { ReactNode } from "react";
import { REASON_STYLES, type MedicalReason } from "../../core/constants/medicalReasons";
import {
  VACCINE_STATUS_LABELS,
  VACCINE_STATUS_STYLES,
} from "../../core/constants/vaccines";
import type { VaccineStatus } from "../../core/types/models";
import { cn } from "../../lib/utils";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ReasonBadge({ reason }: { reason: MedicalReason }) {
  return (
    <Badge className={REASON_STYLES[reason].badge}>
      <span className={cn("h-1.5 w-1.5 rounded-full", REASON_STYLES[reason].dot)} />
      {reason}
    </Badge>
  );
}

export function VaccineStatusBadge({ status }: { status: VaccineStatus }) {
  return <Badge className={VACCINE_STATUS_STYLES[status]}>{VACCINE_STATUS_LABELS[status]}</Badge>;
}
