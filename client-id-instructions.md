# Client ID Image Instructions

## Current Image URL
The bot currently uses a placeholder image:
```
https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Exness+Client+ID+Location
```

## How to Replace with Real Screenshot

1. **Take a Screenshot**
   - Login to Exness Personal Area
   - Navigate to "My Account" section
   - Take a screenshot showing where the Client ID is displayed
   - Highlight or circle the Client ID field

2. **Upload to Image Hosting**
   - Upload to Imgur, Google Drive, or any image hosting service
   - Make sure the image is publicly accessible
   - Get the direct image URL

3. **Update the Bot Code**
   Replace the placeholder URL in both files:
   - `test-bot.js` (line ~614)
   - `api/webhook.js` (line ~477)
   
   Change:
   ```javascript
   'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Exness+Client+ID+Location'
   ```
   
   To:
   ```javascript
   'https://your-image-hosting-service.com/your-client-id-screenshot.png'
   ```

4. **Redeploy**
   ```bash
   npm run deploy
   ```

## Image Requirements
- **Size**: 600x400 pixels or similar aspect ratio
- **Format**: PNG or JPG
- **Content**: Clear view of Exness Personal Area showing Client ID location
- **Annotations**: Arrow or highlight pointing to Client ID field
- **Text**: Should be readable and clear

## Alternative: Use Telegram Photo Upload
Instead of external hosting, you can also upload the image directly to Telegram and use the file_id, but external URL is more reliable for webhooks.
