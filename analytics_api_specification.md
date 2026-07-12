# Datalk Analytics API Specification

This document outlines the API required to feed data into the Datalk Analytics and Dashboard pages.

## Get Analytics Overview

Retrieves high-level performance metrics, activity details, user satisfaction breakdown, top asked questions, and open (unanswered) questions.

- **URL:** `/api/analytics` (Next.js client route) or backend endpoint `/api/v1/analytics`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

### Response Body

**Status Code:** `200 OK`

```json
{
  "totalConversations": 284,
  "totalMessages": 1847,
  "avgMessagesPerConversation": 6.5,
  "avgResponseTimeMs": 820,
  "unansweredRate": 0.12,
  "satisfaction": {
    "thumbsUp": 198,
    "thumbsDown": 34,
    "noFeedback": 52
  },
  "topQuestions": [
    {
      "id": "q1",
      "question": "What are the pricing plans?",
      "count": 48,
      "lastAsked": "2026-07-07T14:23:00Z"
    },
    {
      "id": "q2",
      "question": "How do I cancel my subscription?",
      "count": 37,
      "lastAsked": "2026-07-08T09:11:00Z"
    },
    {
      "id": "q3",
      "question": "What is the refund policy?",
      "count": 31,
      "lastAsked": "2026-07-07T18:05:00Z"
    },
    {
      "id": "q4",
      "question": "How do I integrate with Slack?",
      "count": 27,
      "lastAsked": "2026-07-06T12:44:00Z"
    },
    {
      "id": "q5",
      "question": "Is there an API available?",
      "count": 22,
      "lastAsked": "2026-07-08T07:30:00Z"
    },
    {
      "id": "q6",
      "question": "How do I export my data?",
      "count": 19,
      "lastAsked": "2026-07-05T16:20:00Z"
    },
    {
      "id": "q7",
      "question": "Do you support SSO?",
      "count": 15,
      "lastAsked": "2026-07-04T10:00:00Z"
    },
    {
      "id": "q8",
      "question": "What file formats are supported?",
      "count": 14,
      "lastAsked": "2026-07-03T08:15:00Z"
    }
  ],
  "unansweredQuestions": [
    {
      "id": "u1",
      "question": "Can I white-label the chatbot?",
      "askedAt": "2026-07-08T08:45:00Z",
      "botName": "Docs Assistant"
    },
    {
      "id": "u2",
      "question": "Do you have HIPAA compliance docs?",
      "askedAt": "2026-07-07T21:15:00Z",
      "botName": "Support Bot"
    },
    {
      "id": "u3",
      "question": "What is your SLA for enterprise customers?",
      "askedAt": "2026-07-07T17:30:00Z",
      "botName": "Docs Assistant"
    },
    {
      "id": "u4",
      "question": "How do I configure webhooks?",
      "askedAt": "2026-07-07T14:00:00Z",
      "botName": "Support Bot"
    },
    {
      "id": "u5",
      "question": "Can I import data from Notion?",
      "askedAt": "2026-07-06T11:20:00Z",
      "botName": "Docs Assistant"
    }
  ],
  "dailyConversations": [
    {
      "date": "2026-07-01",
      "conversations": 28,
      "messages": 182
    },
    {
      "date": "2026-07-02",
      "conversations": 34,
      "messages": 221
    },
    {
      "date": "2026-07-03",
      "conversations": 22,
      "messages": 143
    },
    {
      "date": "2026-07-04",
      "conversations": 18,
      "messages": 117
    },
    {
      "date": "2026-07-05",
      "conversations": 31,
      "messages": 201
    },
    {
      "date": "2026-07-06",
      "conversations": 45,
      "messages": 293
    },
    {
      "date": "2026-07-07",
      "conversations": 52,
      "messages": 338
    },
    {
      "date": "2026-07-08",
      "conversations": 54,
      "messages": 352
    }
  ]
}
```

### JSON Data Fields Description

| Field | Type | Description |
|---|---|---|
| `totalConversations` | Integer | Total number of chat sessions across all chatbots. |
| `totalMessages` | Integer | Total number of messages (user + assistant) sent across all chats. |
| `avgMessagesPerConversation` | Float | Average number of messages in a single conversation. |
| `avgResponseTimeMs` | Integer | Average response latency of the assistant in milliseconds. |
| `unansweredRate` | Float | Ratio of unanswered messages (rate from `0.0` to `1.0`). |
| `satisfaction` | Object | User feedback breakdown. |
| `satisfaction.thumbsUp` | Integer | Count of positive (thumbs up) feedback ratings. |
| `satisfaction.thumbsDown` | Integer | Count of negative (thumbs down) feedback ratings. |
| `satisfaction.noFeedback` | Integer | Count of conversations closed without any feedback rating. |
| `topQuestions` | Array | Frequently asked visitor questions. |
| `topQuestions[].id` | String | Unique question identifier. |
| `topQuestions[].question`| String | Text representation of the question. |
| `topQuestions[].count` | Integer | Total occurrences of the question (or similar semantically). |
| `topQuestions[].lastAsked`| String | Timestamp of the last time this question was asked (ISO 8601). |
| `unansweredQuestions` | Array | List of questions that did not trigger a high-confidence answer. |
| `unansweredQuestions[].id`| String | Unique identifier. |
| `unansweredQuestions[].question`| String| The question text. |
| `unansweredQuestions[].askedAt`| String| Timestamp when requested (ISO 8601). |
| `unansweredQuestions[].botName`| String | Name of the chatbot widget that received the question. |
| `dailyConversations` | Array | List of aggregated metrics per day over the reporting period (last 8 days). |
| `dailyConversations[].date`| String | The specific date (format: `YYYY-MM-DD`). |
| `dailyConversations[].conversations`| Integer| Conversations count for that day. |
| `dailyConversations[].messages`| Integer| Messages count for that day. |
