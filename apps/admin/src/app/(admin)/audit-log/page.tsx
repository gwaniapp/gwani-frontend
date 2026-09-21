import type { Metadata } from "next";
import { AuditLogView } from "@/features/admin/components/AuditLogView";

export const metadata: Metadata = { title: "Audit log" };

export default function Page() {
	return <AuditLogView />;
}
