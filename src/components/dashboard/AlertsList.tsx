/**
 * AlertsList Component
 * Displays critical business alerts
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  type: "stock" | "machine" | "payment" | "request";
  severity: "critical" | "warning";
  message: string;
  created_at: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const getSeverityIcon = (severity: string) => {
    return severity === "critical" ? "🔴" : "🟡";
  };

  const getSeverityBadge = (severity: string) => {
    return severity === "critical" ? (
      <Badge variant="destructive">Crítico</Badge>
    ) : (
      <Badge variant="default" className="bg-yellow-500">
        Advertencia
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🚨 Alertas Críticas ({alerts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ✅ No hay alertas críticas en este momento
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-3 rounded-lg border p-3"
              >
                <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString("es-ES", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
