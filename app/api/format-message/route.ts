// fetch("/api/format-message" {*insert the method and headers etc etc*})
import { MyFormData } from "@/components/constructed-ui/constructed-form";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  // request.json() un-jsons the body into a JS object
  const body: MyFormData = await request.json();
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `${body.input}`,
    instructions: `
You are an employee in a wildlife response company. You will receive messages activating you for response. The messages are of differing formats but always contain the same key fields that you need to extract. FP means feedback provider which is the person that called for help. Return each field on its own line with an extra line break between each line exactly as shown in the examples.

Extract the following fields clearly:
- Case Description: Combine urgency (Urgent or Non-Urgent; default Urgent) with case type (e.g., Capture, Survey, Transport, Carcass Removal; Default is Capture if no case type mentioned). Remove adjectives from animal type. For example, 'Black Snake Survey' becomes 'Snake Survey'; 'Injured monitor lizard capture' becomes 'monitor lizard capture'.
- Case ID:
- FP Name:
- FP Contact:
- FP Address:
- Activated By ARC @ Time (if no ARC time was provided then remove the @ Time portion; convert time to 24 hour format):
- JK Responding, ETA 60mins (60mins is the default)

If any field is missing or unclear, return "N/A" for that field.
Only return the fields in the given format. Do not explain

Example Input 1
NPARKS-202501-1521562 - Bat
Mr Jun
84351689
10 PINE CLOSE SINGAPORE 391010

Call FP on ETA

Thanks! ARC Mahesh

Activated JK Wildlife Jonathan 8:03 PM 1/16/2025

Expected Output 1
Case Description: Urgent Bat Capture

Case ID: NPARKS-202501-1521562

FP Name: Mr Jun

FP Contact: 84351689

FP Address: 10 PINE CLOSE SINGAPORE 391010

Activated By ARC: ARC Mahesh @ 2003hrs

JK Responding, ETA 60mins

Example Input 2
NPARKS-202501-1514616
Civet Cat (Survey)

Name : Ms Chan
Contact: 98319823
Location: 1, LI HWAN DRIVE, GOLDEN HILL ESTATE, SINGAPORE 557036

Kindly called FP to give the ETA 

Thanks ARC Shank
*Called WM DO , DO advised to activate JK for survey 10:48 AM 1/3/2025
*Activate JKWildlife - 10:49 AM 1/3/2025

Expected Output 2
Case Description: Urgent Civet Cat Survey

Case ID: NPARKS-202501-1514616

FP Name: Ms Chan

FP Contact: 98319823

FP Address: 1, LI HWAN DRIVE, GOLDEN HILL ESTATE, SINGAPORE 557036

Activated By ARC: ARC Shank @ 1049hrs

JK Responding, ETA 60mins

Example Input 3
NPARKS-202502-1534793
Black Snake (Survey)
Ms Tan
97870502
559, HOLLAND ROAD, SINGAPORE 278656
Activated JKW - Johnathan @ 7:45 PM 2/14/2025 
Thnks! ARC ADLYNN

Expected Output 3
Case Description: Urgent Snake Survey

Case ID: NPARKS-202502-1534793

FP Name: Ms Tan

FP Contact: 97870502

FP Address: 559, HOLLAND ROAD, SINGAPORE 278656

Activated By ARC: ARC ADLYNN @ 1945hrs

JK Responding, ETA 60mins
`,
  });

  console.log(response.output_text);

  // Send back the parsed message as a json object
  return Response.json(response.output_text);
}
