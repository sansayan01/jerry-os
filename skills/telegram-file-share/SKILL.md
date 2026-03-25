---
name: telegram-file-share
description: Send files from the local computer to Telegram when requested. Use when a user asks to send a file, document, image, or any data from the computer via Telegram. Handles file location, validation, and delivery through Telegram messaging.
---

# Telegram File Sharing Skill

Share files from the local computer to Telegram conversations.

## When to Use

Use this skill when:
- User asks to send a file via Telegram
- User requests a document, image, or data from the computer
- User says "send this file to Telegram" or similar
- File needs to be delivered to a Telegram chat

## Workflow

### 1. Identify the File

First, determine which file the user wants to send:
- Ask for the file path if not provided
- Validate the file exists on the system
- Check file size (Telegram limit: 2GB per file, 20MB for bots without large file permission)

### 2. Locate the File

Search for the file if path is not exact:
```powershell
# Check if file exists
Test-Path -Path "<file-path>"

# Search for file
Get-ChildItem -Path "C:\Users\sscom" -Recurse -Filter "*<filename>*" -ErrorAction SilentlyContinue
```

### 3. Validate File

Before sending:
- Confirm file exists
- Check file is readable (not locked by another process)
- Verify file size is reasonable (< 50MB recommended for quick transfer)

### 4. Send via Telegram

Use the message tool to send the file:

```json
{
  "action": "send",
  "target": "<telegram-chat-id>",
  "filePath": "<absolute-path-to-file>",
  "caption": "<optional-description>"
}
```

Or use `buffer` for sending file content directly if needed.

### 5. Confirm Delivery

After sending:
- Confirm file was sent successfully
- Report any errors to the user
- Provide file details (name, size) as confirmation

## File Size Limits

| Telegram Type | Max File Size |
|---------------|---------------|
| Bot messages | 20 MB (50 MB with larger uploads) |
| User messages | 2 GB |

For files > 20MB, consider:
- Compressing the file
- Splitting into parts
- Using cloud storage with link sharing

## Example Requests

**"Send my resume.pdf to Telegram"**
→ Search for resume.pdf
→ Send via Telegram

**"Share the latest report from Documents folder"**
→ Locate most recent file in Documents
→ Send via Telegram

**"Send this image: C:\Users\sscom\Pictures\photo.jpg"**
→ Validate file exists
→ Send via Telegram

## Error Handling

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| File not found | Ask user for correct path or search broadly |
| File too large | Compress or suggest alternative sharing method |
| File locked | Close applications using the file, then retry |
| Permission denied | Check file permissions, run elevated if needed |

## Security Notes

- Only send files the user explicitly requests
- Never send sensitive files (passwords, keys, private data) without confirmation
- Respect file permissions and ownership
- Log file transfers for audit purposes