"use client";

/// Forms
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/// Hooks
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

/// UI
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
import { Label } from "../ui/label";
import { SyncLoader } from "react-spinners";
import { Copy } from "lucide-react";

// For now, the form just has one field which is the input for the whatsapp msg that must be a string
const formSchema = z.object({
  input: z.string().min(5),
});

export type MyFormData = z.infer<typeof formSchema>;

export default function ConstructedForm() {
  const [parsedMessage, setParsedMessage] = useState("");
  const [copiedMessage, copy] = useCopyToClipboard();

  // Configure all the form requirements first like RHF, zod etc
  const form = useForm<MyFormData>({
    resolver: zodResolver(formSchema),
  });
  const formSubmitting = form.formState.isSubmitting;

  // API routes are always accessed from the root URL at /api/[folder-name]
  const onSubmit: SubmitHandler<MyFormData> = async (
    formSubmission: MyFormData
  ) => {
    // As of now, the formSubmission is only {input: "..."}
    // If i JSON.stringify, then ill get {"input": "..."} which isnt what openAI API wants right
    const body = JSON.stringify(formSubmission);
    try {
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
    } catch (error) {
      console.log("Error in onSubmit form: " + error);
    }
  };

  const handleCopy = (message: string) => {
    copy(message)
      .then(() => {
        console.log("Copied!", { message });
      })
      .catch((error) => {
        console.error("Failed to copy!", error);
      });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
          <Button type="submit" disabled={formSubmitting ? true : false}>
            Submit
          </Button>
        </form>
      </Form>

      <Label>Output</Label>
      {formSubmitting ? (
        <SyncLoader size={10} />
      ) : (
        <div>
          <Textarea
            value={parsedMessage}
            onChange={(e) => setParsedMessage(e.target.value)}
          />
          <Button onClick={() => handleCopy(parsedMessage)}>
            <Copy />
          </Button>
        </div>
      )}
    </>
  );
}
