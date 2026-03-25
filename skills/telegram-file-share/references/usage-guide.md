# Telegram File Share - Quick Usage Guide

## How to Request File Sharing

Simply ask in natural language:

```
"Send my resume.pdf to Telegram"
"Share the photo from Desktop"
"Send C:\Users\sscom\Documents\report.docx via Telegram"
"Find and send the latest PDF in Downloads"
```

## Examples by File Type

### Documents (.pdf, .docx, .txt)
```
"Send my meeting notes from Documents"
"Share the contract.pdf file"
```

### Images (.jpg, .png, .gif)
```
"Send the screenshot from Desktop"
"Share my profile picture"
```

### Data Files (.json, .csv, .xlsx)
```
"Send the data export"
"Share sales_report.xlsx"
```

### Any File
```
"Send file at C:\path\to\file.ext"
"Find and send config.json"
```

## File Size Considerations

| Size | Status | Action |
|------|--------|--------|
| < 20 MB | ✅ Direct send | No action needed |
| 20-50 MB | ⚠️ May need approval | Bot will warn |
| > 50 MB | ❌ Too large | Suggest alternatives |

## Alternative for Large Files

If a file is too large for Telegram bot:
1. Upload to Google Drive/Dropbox
2. Get shareable link
3. Send the link via Telegram
4. Or compress the file before sending

## Troubleshooting

**"File not found"**
→ Provide exact path or check filename spelling

**"Access denied"**
→ File may be open in another application. Close it and retry.

**"File too large"**
→ Compress using 7-Zip or send via cloud storage link

## Locations Searched

By default, searches in:
- `C:\Users\sscom\` (your home directory)
- Common folders: Desktop, Documents, Downloads, Pictures

## Security

Only files you explicitly request will be sent. You'll be asked to confirm before sending sensitive files.