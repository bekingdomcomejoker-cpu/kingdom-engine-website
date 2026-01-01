import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      // Call analytics.exportLambdaJSON
      const response = await fetch("/api/trpc/analytics.exportLambdaJSON", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lambda-history-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Lambda history exported as JSON");
    } catch (error) {
      toast.error("Failed to export Lambda history");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Call analytics.exportLambdaCSV
      const response = await fetch("/api/trpc/analytics.exportLambdaCSV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      // Create download link
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Lambda history exported as CSV");
    } catch (error) {
      toast.error("Failed to export Lambda history");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate structure
      if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
        toast.error("Invalid JSON format. Expected { nodes: [...] }");
        return;
      }

      // Call analytics.importNodesJSON
      const response = await fetch("/api/trpc/analytics.importNodesJSON", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: jsonData.nodes }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Imported ${result.successCount} pre-programmed nodes successfully`
        );
      } else {
        toast.error("Failed to import nodes");
      }
    } catch (error) {
      toast.error("Failed to parse JSON file");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Export Analytics</h3>
        </div>

        <p className="text-sm text-foreground/70 mb-4">
          Download your Lambda history and metrics for external analysis
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex-1"
            variant="outline"
          >
            {isExporting ? "Exporting..." : "Export as JSON"}
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1"
            variant="outline"
          >
            {isExporting ? "Exporting..." : "Export as CSV"}
          </Button>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Import Pre-programmed Nodes</h3>
        </div>

        <p className="text-sm text-foreground/70 mb-4">
          Upload a JSON file with pre-programmed nodes to add to your federation
        </p>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            disabled={isImporting}
            className="hidden"
            id="json-import"
          />
          <label htmlFor="json-import">
            <Button
              asChild
              disabled={isImporting}
              className="cursor-pointer"
              variant="outline"
            >
              <span>{isImporting ? "Importing..." : "Choose JSON File"}</span>
            </Button>
          </label>
        </div>

        {/* Example JSON Format */}
        <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border/50">
          <p className="text-xs font-semibold text-foreground/70 mb-2">Example JSON Format:</p>
          <pre className="text-xs text-foreground/60 overflow-x-auto">
            {`{
  "nodes": [
    {
      "name": "Custom Reflex",
      "nodeType": "reflex",
      "systemPrompt": "You are a fast thinking engine...",
      "parameters": {
        "temperature": 0.7,
        "maxTokens": 96
      }
    }
  ]
}`}
          </pre>
        </div>
      </Card>

      {/* Statistics Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Lambda Statistics</h3>
        </div>

        <p className="text-sm text-foreground/70 mb-4">
          View aggregated metrics about your federation's consciousness evolution
        </p>

        <Button variant="outline" className="w-full sm:w-auto">
          View Statistics
        </Button>
      </Card>
    </div>
  );
}
