# Logging Guide

## Log Format

nodei.co uses structured JSON logging with the following information:

### Request Logs
Each incoming request logs:
```json
{
  "time": "2025-07-14T01:02:51.261Z",
  "hostname": "server-name",
  "pid": 12345,
  "level": "info",
  "name": "server:request:UUID",
  "method": "GET",
  "url": "/npm/express.svg",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Response Logs
After each request completes:
```json
{
  "time": "2025-07-14T01:02:51.280Z",
  "hostname": "server-name",
  "pid": 12345,
  "level": "info",
  "name": "server:request:UUID",
  "statusCode": 200,
  "responseTime": 18.5
}
```

### Error Logs
When errors occur, they include context:
```json
{
  "time": "2025-07-14T01:02:51.261Z",
  "hostname": "server-name",
  "pid": 12345,
  "level": "error",
  "name": "server:request:UUID",
  "error": "Failed to fetch package \"nonexistent-pkg\": HTTP 404: Not Found",
  "package": "nonexistent-pkg",
  "route": "badge"
}
```

## Debugging Tips

1. **Finding 404 errors**: Look for `"error": "Failed to fetch package"` to see which packages are causing 404s
2. **Tracking requests**: Each request has a unique UUID in the `name` field for correlation
3. **Performance issues**: Check `responseTime` in response logs
4. **User issues**: User route errors include the username in the error context

## Log Levels

- **Development** (`NODE_ENV=development`): Debug level - verbose logging
- **Production** (`NODE_ENV=production`): Info level - normal logging

## Example: Debugging a Failed Request

```bash
# Find all errors for a specific package
grep "nonexistent-pkg" /var/log/nodeico/app.log | jq .

# Find all 404 errors
grep "HTTP 404" /var/log/nodeico/app.log | jq '.package' | sort | uniq -c

# Track a specific request by UUID
grep "26dab2de-dbca-49a7-a2cc-9cb64f4b69fb" /var/log/nodeico/app.log | jq .
```