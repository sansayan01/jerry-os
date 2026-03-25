# Telegram File Sharing Hook

Allows requesting and receiving files from the local PC via Telegram messages.

## Purpose

Enables authorized Telegram users to request files from the computer by sending simple messages like "send me the file at C:\\path\\to\\file.txt".

## Authorized Users

| Telegram ID | Name | Access |
|-------------|------|--------|
| 1194411669 | First User | ✅ Full Access |
| 8794421716 | Sk Alamgir | ✅ Full Access |

## How to Use

Send any of these message patterns in Telegram:

```
Send me the file at C:\Users\sscom\Documents\report.pdf
Send me Documents\report.pdf
Send report.pdf from Documents
Share me C:\Users\sscom\Pictures\photo.jpg
File: C:\Users\sscom\Downloads\data.xlsx
Document C:\path\to\file.txt
```

## Features

- ✅ Auto-resolves relative paths (Documents, Downloads, Desktop, etc.)
- ✅ File size validation (< 20MB limit)
- ✅ Security: Only authorized users can request files
- ✅ Friendly error messages for missing files or directories
- ✅ File size formatting and validation

## Events

- `message` - Intercepts incoming file request messages

## Security

- Only specific Telegram user IDs can request files
- Path validation to prevent directory traversal
- No sensitive system files accessible without full path
- File must exist and be readable