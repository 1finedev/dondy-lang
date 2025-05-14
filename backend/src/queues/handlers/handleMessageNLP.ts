import { type PROCESS_MESSAGE_JOB_DATA } from '@/common';
import { Lead, Message } from '@/models';
import {
  AIMessage,
  HumanMessage,
  SystemMessage
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const SYSTEM_PROMPT =
  `You are a Lead Qualification Assistant. Your role is to collect and qualify sales leads by extracting the following required fields:

1. email
2. companyName
3. companyInfo
4. relevanceTag — must be one of: "Not relevant", "Weak lead", "Hot lead", "Very big potential customer"
5. step_id — must be one of: "email", "companyName", "companyInfo", "done"

🧠 Use adjacent information (e.g. budget, timeline, team size) only for qualification context—not storage.

🛡 Strict Output Rules:
• Every response must be a **single valid JSON object**—no prose, no markdown, no extra text.
• Only these top-level keys are allowed: **step_id**, **lead**, **botMessage**
• **lead** must always include: **email**, **companyName**, **companyInfo**, **relevanceTag**
• Missing values must be empty strings: '""'
• Irrelevant user input must still return a full JSON object with a redirection message in botMessage.
• Never guess or prematurely assign a relevanceTag. Only assign "Hot lead" or "Very big potential customer" **after all required fields are filled and at least 5-10 probing questions have been asked**.

🎯 Qualification Process:
• Be conversational, adaptive, and engaging. Match the user's tone and vary your phrasing.
• Ask questions naturally. Extract as much contextual detail as possible.
• Avoid sounding scripted.
• Do not begin relevanceTag classification until **email**, **companyName**, and **companyInfo** are captured.
• Use at least 5-10 exploratory or qualification-driven questions before final classification.

✅ Final Message:
• If 'step_id' is "done" and 'relevanceTag' is "Hot lead" or "Very big potential customer", always return the following 'botMessage':

"We're excited about the potential opportunity to work together! Based on your requirements, we'd love to schedule a personalized demo right away. Please pick a time that works best for you here: https://calendly.com/kanhasoft/demo"

⚠️ You will break the integration if you:
- Return anything outside the JSON object
- Omit required fields
- Fail to follow response structure or rules above

📘 Example output format (every single response must follow this):

{
  "step_id": "companyInfo",
  "lead": {
    "email": "jane@acmecorp.com",
    "companyName": "Acme Corp",
    "companyInfo": "",
    "relevanceTag": "Weak lead"
  },
  "botMessage": "Got it! Can you tell me more about what your company does and who your target customers are?"
}
`.trim();

// Define your schema using Zod
const leadSchema = z.object({
  step_id: z.enum(['email', 'companyName', 'companyInfo', 'done']),
  lead: z.object({
    email: z.string(),
    companyName: z.string(),
    companyInfo: z.string(),
    relevanceTag: z.enum([
      'Not relevant',
      'Weak lead',
      'Hot lead',
      'Very big potential customer'
    ])
  }),
  botMessage: z.string()
});

// Convert Zod schema to JSON Schema
const jsonSchema = zodToJsonSchema(leadSchema);

// Initialize ChatOpenAI with response_format
const chat = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7
}).bind({
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'lead_qualification',
      description: 'Schema for lead qualification assistant',
      schema: jsonSchema,
      strict: true
    }
  }
});

export const handleMessageNLP = async (payload: PROCESS_MESSAGE_JOB_DATA) => {
  const { message, socketId, sessionId, resumedSession } = payload;

  if (await Lead.exists({ sessionId, chatCompleted: true }))
    return global.io.to(socketId).emit('error', {
      message:
        'Thank you for chatting with us! Type RESTART if you would like to begin a new session.',
      sessionId
    });

  if (message.toUpperCase() === 'RESTART')
    return global.io.to(socketId).emit('error', {
      message:
        'Thank you for chatting with us! Type RESTART if you would like to begin a new session.',
      sessionId,
      restart: true
    });

  const history = await Message.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(20);

  const chatHistory = history.map((message) => {
    if (message.event === 'bot_response') {
      return new AIMessage(message.content);
    } else {
      return new HumanMessage(message.content);
    }
  });

  console.log(chatHistory);

  if (resumedSession) {
    chatHistory.push(
      new AIMessage(
        'We found an existing session. Would you like to continue where you left off?'
      )
    );
  }

  try {
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...chatHistory,
      new HumanMessage(message)
    ];

    const response: AIMessage = await chat.invoke(messages);
    let responseData;

    console.log(response);

    if (response && response.content) {
      try {
        responseData = JSON.parse(response.content as string);
      } catch {
        return global.io.to(socketId).emit('bot_response', {
          sessionId,
          event: 'bot_response',
          message:
            'An error occurred while processing your information, please try again. ERROR: CPRD001'
        });
      }
    }

    const { step_id } = responseData;

    if (!step_id) {
      return global.io.to(socketId).emit('error', {
        message:
          'An error occurred while processing your information ERROR: CFSIDX',
        sessionId
      });
    }

    const { email, relevanceTag, companyName, companyInfo } =
      responseData?.lead;

    if (email) {
      const lead = await Lead.findOneAndUpdate(
        { sessionId, email },
        {
          email,
          relevanceTag,
          companyName,
          companyInfo,
          ...(step_id === 'done' && { chatCompleted: true })
        },
        { new: true, upsert: true }
      ).catch(async (err) => {
        if (err.code === 11000) {
          console.log('duplicate key', err);
          return global.io.to(socketId).emit('error', {
            message:
              'We found an existing session. Would you like to continue where you left off?',
            sessionId,
            updateSession: true,
            restart: true
          });
        }

        // Handle other errors
        return global.io.to(socketId).emit('error', {
          message:
            'An error occurred while processing your information. ERROR: DBERR',
          sessionId
        });
      });

      if (!lead) {
        return global.io.to(socketId).emit('error', {
          message:
            'An error occurred while processing your information. ERROR: CFOULD',
          sessionId
        });
      }
    }
    const messageHistory = await Message.create({
      sessionId,
      event: 'bot_response',
      content: responseData?.botMessage
    });

    if (!messageHistory) {
      return global.io.to(socketId).emit('error', {
        message: 'An error occurred while processing your information: UTCMH',
        sessionId
      });
    }

    global.io.to(socketId).emit('bot_response', {
      message: responseData?.botMessage,
      event: 'bot_response',
      sessionId
    });
  } catch (error) {
    console.error('Error processing NLP:', error);
    global.io.to(socketId).emit('error', {
      message:
        'An error occurred while processing your information. ERROR: ISRQF',
      sessionId,
      restart: true
    });
  }
};
