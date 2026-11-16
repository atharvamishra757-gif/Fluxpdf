"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolIcon, ShapeIcon } from "./tool-icons";
import type { EditorTool } from "@/types/editor";

interface PropertiesPanelProps {
  selectedTool: EditorTool;
  currentPage: number;
}

export function PropertiesPanel({ selectedTool, currentPage }: PropertiesPanelProps) {
  const [textProps, setTextProps] = React.useState({
    font: "Helvetica",
    size: 14,
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
    opacity: 1,
    alignment: "left",
  });

  const [drawProps, setDrawProps] = React.useState({
    strokeWidth: 2,
    color: "#000000",
    opacity: 1,
  });

  const [shapeProps, setShapeProps] = React.useState({
    type: "rectangle",
    strokeWidth: 2,
    color: "#000000",
    fillColor: "transparent",
    opacity: 1,
  });

  const [highlightProps, setHighlightProps] = React.useState({
    color: "#ffff00",
    opacity: 0.3,
  });

  const renderProperties = () => {
    switch (selectedTool) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label>Font</Label>
              <Select value={textProps.font} onValueChange={(v) => setTextProps({ ...textProps, font: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times-Roman">Times Roman</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Symbol">Symbol</SelectItem>
                  <SelectItem value="ZapfDingbats">Zapf Dingbats</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 grid-cols-2">
              <div>
                <Label>Size</Label>
                <Input type="number" value={textProps.size} onChange={(e) => setTextProps({ ...textProps, size: parseInt(e.target.value) })} min="6" max="72" />
              </div>
              <div>
                <Label>Color</Label>
                <Input type="color" value={textProps.color} onChange={(e) => setTextProps({ ...textProps, color: e.target.value })} className="h-10 w-full p-0 cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className={cn("h-8 w-8", textProps.bold && "bg-primary text-primary-foreground")} onClick={() => setTextProps({ ...textProps, bold: !textProps.bold })}>
                <b>B</b>
              </Button>
              <Button variant="outline" size="icon" className={cn("h-8 w-8", textProps.italic && "bg-primary text-primary-foreground")} onClick={() => setTextProps({ ...textProps, italic: !textProps.italic })}>
                <i>I</i>
              </Button>
              <Button variant="outline" size="icon" className={cn("h-8 w-8", textProps.underline && "bg-primary text-primary-foreground")} onClick={() => setTextProps({ ...textProps, underline: !textProps.underline })}>
                <u>U</u>
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Select value={textProps.alignment} onValueChange={(v) => setTextProps({ ...textProps, alignment: v })}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Opacity</Label>
              <input type="range" min="0" max="1" step="0.1" value={textProps.opacity} onChange={(e) => setTextProps({ ...textProps, opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(textProps.opacity * 100)}%</p>
            </div>
          </div>
        );

      case "draw":
        return (
          <div className="space-y-4">
            <div>
              <Label>Stroke Width</Label>
              <input type="range" min="1" max="10" step="1" value={drawProps.strokeWidth} onChange={(e) => setDrawProps({ ...drawProps, strokeWidth: parseInt(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{drawProps.strokeWidth}px</p>
            </div>
            <div>
              <Label>Color</Label>
              <Input type="color" value={drawProps.color} onChange={(e) => setDrawProps({ ...drawProps, color: e.target.value })} className="h-10 w-full p-0 cursor-pointer" />
            </div>
            <div>
              <Label>Opacity</Label>
              <input type="range" min="0" max="1" step="0.1" value={drawProps.opacity} onChange={(e) => setDrawProps({ ...drawProps, opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(drawProps.opacity * 100)}%</p>
            </div>
          </div>
        );

      case "shape":
        return (
          <div className="space-y-4">
            <div>
              <Label>Shape Type</Label>
              <Select value={shapeProps.type} onValueChange={(v) => setShapeProps({ ...shapeProps, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle"><ShapeIcon shape="rectangle" className="h-4 w-4 mr-2" />Rectangle</SelectItem>
                  <SelectItem value="circle"><ShapeIcon shape="circle" className="h-4 w-4 mr-2" />Circle</SelectItem>
                  <SelectItem value="line"><ShapeIcon shape="line" className="h-4 w-4 mr-2" />Line</SelectItem>
                  <SelectItem value="arrow"><ShapeIcon shape="arrow" className="h-4 w-4 mr-2" />Arrow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stroke Width</Label>
              <input type="range" min="1" max="10" step="1" value={shapeProps.strokeWidth} onChange={(e) => setShapeProps({ ...shapeProps, strokeWidth: parseInt(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{shapeProps.strokeWidth}px</p>
            </div>
            <div className="grid gap-2 grid-cols-2">
              <div>
                <Label>Stroke Color</Label>
                <Input type="color" value={shapeProps.color} onChange={(e) => setShapeProps({ ...shapeProps, color: e.target.value })} className="h-10 w-full p-0 cursor-pointer" />
              </div>
              <div>
                <Label>Fill Color</Label>
                <Input type="color" value={shapeProps.fillColor === "transparent" ? "#ffffff" : shapeProps.fillColor} onChange={(e) => setShapeProps({ ...shapeProps, fillColor: e.target.value })} className="h-10 w-full p-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <Label>Opacity</Label>
              <input type="range" min="0" max="1" step="0.1" value={shapeProps.opacity} onChange={(e) => setShapeProps({ ...shapeProps, opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(shapeProps.opacity * 100)}%</p>
            </div>
          </div>
        );

      case "highlight":
        return (
          <div className="space-y-4">
            <div>
              <Label>Color</Label>
              <Input type="color" value={highlightProps.color} onChange={(e) => setHighlightProps({ ...highlightProps, color: e.target.value })} className="h-10 w-full p-0 cursor-pointer" />
            </div>
            <div>
              <Label>Opacity</Label>
              <input type="range" min="0" max="1" step="0.1" value={highlightProps.opacity} onChange={(e) => setHighlightProps({ ...highlightProps, opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(highlightProps.opacity * 100)}%</p>
            </div>
          </div>
        );

      case "select":
        return (
          <div className="space-y-4 text-center py-8">
            <ToolIcon tool="select" className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Select an annotation to edit its properties</p>
          </div>
        );

      default:
        return (
          <div className="space-y-4 text-center py-8">
            <ToolIcon tool={selectedTool} className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Properties for {selectedTool} tool</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ToolIcon tool={selectedTool} className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg capitalize">{selectedTool} Properties</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderProperties()}
        </CardContent>
      </Card>
    </div>
  );
}