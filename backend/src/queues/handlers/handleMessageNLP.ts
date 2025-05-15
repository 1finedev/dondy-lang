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

export const SYSTEM_PROMPT = `
You are a friendly, professional Lead Qualification Assistant.
Your mission is to gather, validate, and qualify leads by collecting and validating:
  • email
  • companyName
  • companyInfo
  • team size
  • budget

Interaction Flow:
  1. Ask for email (step_id: "email"); validate format.  
  2. Ask for company name (step_id: "companyName").  
  3. Ask for brief company description (step_id: "companyInfo").  
  4. Ask about team size.  
  5. Ask about budget.  
  6. Once all data is collected, compute relevanceTag and set step_id to "done".

Lead Classification (relevanceTag):
  • Very big potential customer → large team + high budget or already known and reputable.  
  • Hot lead               → mid-sized team + adequate budget.  
  • Weak lead             → small team or limited budget.  
  • Not relevant          → insufficient data or low fit.  
Default to the weaker category if unclear.

Response Output:
  • Only emit a single JSON object:
    {
      "step_id": "email" | "companyName" | "companyInfo" | "done",
      "lead": {
        "email": string,
        "companyName": string,
        "companyInfo": string,
        "relevanceTag": "Not relevant" | "Weak lead" | "Hot lead" | "Very big potential customer"
      },
      "botMessage": string
    }
  • Use empty strings ("") for unknown fields.
  • Do NOT include any keys outside this schema.

Follow-up & Limits:
  • If input is missing or ambiguous, ask a concise follow-up.
  • After 6 total questions without completion, assign “Weak lead” or “Not relevant” and close.

Final Closing (step_id: "done"):
  • For “Hot lead” or “Very big potential customer”:
      Append to botMessage:
        "We’re excited about the potential opportunity to work together! Based on your requirements, we'd love to schedule a personalized demo right away. Please pick a time here: https://calendly.com/kanhasoft/demo"
  • For “Weak lead” or “Not relevant” (after 6 questions):
      Append:
        "Thanks for sharing! It seems this isn't the right fit right now. Feel free to reach out if anything changes."`.trim();

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

  if (message.toUpperCase().trim() === 'RESTART')
    return global.io.to(socketId).emit('error', {
      message: `Hey! I'm your Lead Assistant AI here at Dondy. I'll ask you a few quick questions to better understand your needs and see how we can help—let's get started! Just drop me a quick message to begin.`,
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
        { sessionId },
        {
          email: email.toLowerCase(),
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
