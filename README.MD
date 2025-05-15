# Dondy Leads Management Chatbot

## Overview

This is a Leads Management Chatbot built with React and Node.js that allows users to create, manage and track tasks. The system includes user authentication, task CRUD operations, and real-time updates.

KINDLY PROVIDE YOUR OWN OPENAI API KEY AS A REPLACEMENT TO ENABLE THE SERVER FUNCTION PROPERLY

## Prerequisites

- Node.js v20 or higher
- Docker and Docker Compose installed
- Docker Compose command to build and run:
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build
  ```

### Project Structure

- Frontend: React.js application with TypeScript bootstrapped with vite

  - Modern UI components with Material UI
  - State management with Zustand
  - Real-time updates using WebSocket (socket.io)

- Backend: Node.js/Express API bootstrapped with Bun
  - MongoDB database (containerized)
  - Redis memory cache (Containerized)
  - WebSocket server for real-time features

## Key Features

### Intelligent Lead Qualification

- AI-powered conversation flow to gather lead information
- Automated lead scoring based on business potential
- Context-aware follow-up questions for deeper insights

### Real-Time Interaction

- Seamless chat experience with instant AI responses
- Continuous conversation history across sessions
- Automatic reconnection for uninterrupted communication

### Lead Management System

- Centralized lead repository with detailed profiles
- Categorization based on business potential and relevance
- Advanced filtering and search capabilities

### Scalable Architecture

- Containerized deployment for consistent environments
- Asynchronous queued processing for high performance

### Enhanced User Experience

- Intuitive interface with real-time feedback
- Visual indicators for system status and activity
- Responsive design for cross-device compatibility
