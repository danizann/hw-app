import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "secondary",
  DONE: "success",
  CANCELLED: "destructive",
  UNPAID: "warning",
  PAID: "success",
  ADMIN: "default",
  STAFF: "secondary",
  IN: "success",
  OUT: "destructive",
  ORDER_LETTER: "info",
  FOR_SELLER: "default",
  FOR_SUPPLIER: "secondary",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={statusMap[value] ?? "outline"}>{value.replace(/_/g, " ")}</Badge>;
}
