"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Label } from "../ui/label";

// For now, the form just has one field which is the input for the whatsapp msg that must be a string
const formSchema = z.object({
  input: z.string().min(5),
});

export type MyFormData = z.infer<typeof formSchema>;

export default function ConstructedForm() {
  const [parsedMessage, setParsedMessage] = useState("");
  // Configure all the form requirements first like RHF, zod etc
  const form = useForm<MyFormData>({
    resolver: zodResolver(formSchema),
  });

  // API routes are always accessed from the root URL at /api/[folder-name]
  const onSubmit: SubmitHandler<MyFormData> = async (
    formSubmission: MyFormData
  ) => {
    // As of now, the formSubmission is only {input: "..."}
    // If i JSON.stringify, then ill get {"input": "..."} which isnt what openAI API wants right
    const body = JSON.stringify(formSubmission);
    const response = await fetch("/api/format-message", {
      method: "POST",
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Unjson the response
    const parsed = await response.json();

    // Set the state to update the UI
    setParsedMessage(parsed);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paste WhatsApp Message Here</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <Label>Output</Label>
      <Textarea value={parsedMessage} readOnly />
    </>
  );
}
