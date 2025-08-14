import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AlertLog } from "@/app/actions";
import { FileClock } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function AlertHistory({ history }: { history: AlertLog[] }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm shadow-lg h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileClock className="h-5 w-5" />
          Advice History
        </CardTitle>
        <CardDescription>
          A log of previously generated AI advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <ScrollArea className="h-full">
            <Table>
            <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Time</TableHead>
                  <TableHead className="w-[50px]">AQI</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {history.length > 0 ? (
                history.map((log) => (
                    <TableRow key={log.timestamp}>
                      <TableCell className="text-xs font-medium">{formatDate(log.timestamp)}</TableCell>
                      <TableCell className="font-bold">{log.aqi}</TableCell>
                      <TableCell className="text-xs font-code">{log.recommendation}</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No history yet.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
