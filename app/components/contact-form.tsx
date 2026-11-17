"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  return (
    <Card className="p-8 md:p-12">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
        <CardDescription>
          Send us a message and we&apos;ll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          alert("Thank you for your message! This is a demo form. In production, this would send your message to our team.");
        }}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="What can we help you with?" required />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea rows={5} placeholder="Tell us about your issue or suggestion..." required />
            </div>
          </div>
          <Button variant="default" type="submit" className="w-full py-3">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
