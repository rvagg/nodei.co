# Deployment Guide

This guide covers deploying nodei.co using systemd on Linux systems.

## Prerequisites

- Node.js 18+ installed
- A user account for running the service (e.g., `nodeico`)
- nginx or another reverse proxy (recommended)

## Setup Steps

### 1. Create User and Directories

```bash
# Create a dedicated user
sudo useradd -r -s /bin/false nodeico

# Create directories
sudo mkdir -p /var/www/nodeico
sudo mkdir -p /var/log/nodeico

# Set ownership
sudo chown -R nodeico:nodeico /var/www/nodeico
sudo chown -R nodeico:nodeico /var/log/nodeico
```

### 2. Deploy Application

```bash
# Clone the repository
cd /var/www
sudo -u nodeico git clone https://github.com/rvagg/nodei.co.git nodeico

# Install dependencies
cd nodeico
sudo -u nodeico npm install --omit=dev
```

### 3. Configure Environment

```bash
# Copy the example environment file
sudo cp /var/www/nodeico/docs/nodeico.env.example /etc/default/nodeico

# Edit the configuration
sudo nano /etc/default/nodeico
```

### 4. Install systemd Service

```bash
# Copy the service file
sudo cp /var/www/nodeico/docs/nodeico.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable nodeico
sudo systemctl start nodeico

# Check status
sudo systemctl status nodeico
```

### 5. Configure Reverse Proxy (nginx)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name nodei.co;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Caching for static assets
        location ~* \.(css|js|ico)$ {
            proxy_pass http://localhost:9000;
            expires 1d;
            add_header Cache-Control "public, immutable";
        }
        
        # Caching for badges
        location ~* \.(svg|png)$ {
            proxy_pass http://localhost:9000;
            expires 5m;
            add_header Cache-Control "public, max-age=300";
        }
    }
}
```

## Monitoring

### View Logs

```bash
# View service logs
sudo journalctl -u nodeico -f

# View application logs (if LOG_FILE is configured)
sudo tail -f /var/log/nodeico/app.log
```

See [LOGGING.md](LOGGING.md) for details on the log format and debugging tips.

### Log Rotation (Optional)

If you're using LOG_FILE, configure log rotation to prevent disk space issues:

```bash
# Copy the logrotate configuration
sudo cp /var/www/nodeico/docs/nodeico.logrotate /etc/logrotate.d/nodeico

# Test the configuration
sudo logrotate -d /etc/logrotate.d/nodeico

# Force a rotation to test it works
sudo logrotate -f /etc/logrotate.d/nodeico
```

The provided logrotate configuration will:
- Rotate logs daily
- Keep 14 days of compressed logs
- Rotate when logs exceed 100MB
- Create new logs with proper permissions
- Restart the service after rotation to reopen log files

### Service Management

```bash
# Start/stop/restart
sudo systemctl start nodeico
sudo systemctl stop nodeico
sudo systemctl restart nodeico

# View status
sudo systemctl status nodeico
```

## Security Considerations

1. The service runs as a non-privileged user (`nodeico`)
2. systemd security hardening is enabled:
   - `NoNewPrivileges=true` - Prevents privilege escalation
   - `PrivateTmp=true` - Isolated /tmp directory
   - `ProtectSystem=strict` - Read-only file system except specified paths
   - `ProtectHome=true` - No access to /home directories

3. Only necessary directories are writable (`ReadWritePaths=/var/log/nodeico`)

## Updates

To update the application:

```bash
cd /var/www/nodeico
sudo -u nodeico git pull
sudo -u nodeico npm ci --production
sudo systemctl restart nodeico
```

## Troubleshooting

1. **Service won't start**: Check logs with `journalctl -u nodeico -n 50`
2. **Permission denied**: Ensure the nodeico user owns all necessary files
3. **Port already in use**: Change PORT in `/etc/default/nodeico`
4. **Out of memory**: Adjust `MemoryMax` in the service file (or `MemoryLimit` for older systemd versions)