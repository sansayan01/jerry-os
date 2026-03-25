# Telegram Greetings Hook

A custom hook for personalized Telegram user greetings.

## Purpose

Automatically greets known Telegram users by name when they message the bot.

## User Mappings

| Telegram ID | Name | Greeting |
|-------------|------|----------|
| 1194411669 | First User | "Hey [firstName]! 👋" |
| 8794421716 | Sk Alamgir | "Hey Sk Alamgir! 👋" |

## Installation

This hook is sourced from the workspace hooks directory.

## Events

- `message` - Intercepts incoming messages from Telegram

## Config

No additional configuration required. User mappings are hardcoded in handler.js.