# Live Lessons (Jitsi Meet Integration)

EduFlex includes built-in video conferencing through a self-hosted Jitsi Meet instance. This allows teachers to conduct live video lessons directly within the platform without requiring students to have external accounts.

## Features

- **Instant Live Lessons**: Teachers can start a video lesson immediately from any course page
- **Scheduled Lessons**: Plan lessons in advance with date/time
- **No External Accounts Required**: Students join directly without needing Google/GitHub/etc login
- **Embedded Experience**: Video conference runs within the EduFlex interface
- **Dashboard Widget**: Upcoming and live lessons shown on user dashboard
- **Automatic Host Detection**: Teachers are automatically recognized as hosts

## Architecture

### Docker Services

The Jitsi stack consists of 4 containers defined in `docker-compose.yml`:

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| jitsi-web | eduflex-jitsi | 8444 | Web frontend |
| jitsi-prosody | eduflex-jitsi-prosody | 5222, 5347, 5280 (internal) | XMPP server |
| jitsi-jicofo | eduflex-jitsi-jicofo | - | Conference focus |
| jitsi-jvb | eduflex-jitsi-jvb | 10000/udp | Video bridge |

### Backend Components

- **LiveLessonController.java**: REST API for creating, starting, ending lessons
- **LiveLesson.java**: Entity model with status (SCHEDULED, LIVE, ENDED, CANCELLED)
- **LiveLessonRepository.java**: JPA queries for fetching lessons

### Frontend Components

- **JitsiMeeting.jsx**: Embedded Jitsi iframe with custom controls
- **LiveLessonButton.jsx**: Button component for course pages (start/join)
- **LiveLessonWidget.jsx**: Dashboard widget showing upcoming lessons

## Configuration

### Environment Variables

**docker-compose.yml** (Jitsi):
```yaml
environment:
  - ENABLE_AUTH=0           # No authentication required
  - ENABLE_GUESTS=1         # Allow guest users
  - ENABLE_PREJOIN_PAGE=0   # Skip prejoin screen
  - ENABLE_LOBBY=0          # No waiting room
  - PUBLIC_URL=http://localhost:8444
```

**Backend** (application.properties):
```properties
jitsi.url=http://localhost:8444
```

### Production Configuration

For production deployment, update `PUBLIC_URL` in all Jitsi services to your domain:

```yaml
- PUBLIC_URL=https://jitsi.yourdomain.com
```

And update the backend:
```properties
jitsi.url=https://jitsi.yourdomain.com
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/live-lessons` | Create new lesson |
| POST | `/api/live-lessons/{id}/start` | Start a scheduled lesson |
| POST | `/api/live-lessons/{id}/end` | End a live lesson |
| GET | `/api/live-lessons/{id}/join` | Get join configuration |
| GET | `/api/live-lessons/upcoming` | Get upcoming lessons for user |
| GET | `/api/live-lessons/course/{courseId}` | Get lessons for a course |
| DELETE | `/api/live-lessons/{id}` | Cancel a scheduled lesson |

### Create Lesson Request

```json
{
  "courseId": 1,
  "title": "Mathematics Lecture",
  "description": "Chapter 5 review",
  "scheduledStart": "2025-01-26T10:00:00",
  "scheduledEnd": "2025-01-26T11:00:00"
}
```

To start immediately, omit `scheduledStart` and `scheduledEnd`.

## Usage

### For Teachers

1. Navigate to a course page
2. Click **"Starta Live"** to begin an instant lesson
3. Or click the calendar icon to schedule a future lesson
4. When done, click the red phone icon or close the meeting

### For Students

1. When a lesson is live, a pulsing **"LIVE - Ga med nu"** button appears
2. Click to join the video conference
3. Students can also see upcoming lessons in the dashboard widget

## Performance Optimizations

The embedded Jitsi client includes several performance optimizations:

- **Resolution**: Limited to 480p (configurable)
- **Frame rate**: 24fps ideal, 30fps max
- **Last-N**: Only receive video from 4 most active speakers
- **P2P mode**: Enabled for 2-participant calls
- **Disabled features**: Virtual backgrounds, audio levels, stats gathering

## Troubleshooting

### Video is laggy

1. Check `channelLastN` setting (default: 4)
2. Verify resolution settings
3. Ensure JVB has enough bandwidth

### "Connection failed" errors

1. Verify all 4 Jitsi containers are running
2. Check that port 8444 is accessible
3. Verify UDP port 10000 is open (required for video)

### Lobby/authentication appears

This should not happen with the self-hosted instance. If it does:
1. Verify `ENABLE_AUTH=0` in docker-compose.yml
2. Ensure you created a NEW lesson after configuration changes
3. Restart the Jitsi containers

## Files Modified

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Jitsi stack configuration |
| `LiveLessonController.java` | REST API endpoints |
| `LiveLesson.java` | Entity model |
| `LiveLessonRepository.java` | Database queries |
| `JitsiMeeting.jsx` | Embedded video component |
| `LiveLessonButton.jsx` | Course page button |
| `LiveLessonWidget.jsx` | Dashboard widget |
| `SecurityConfig.java` | Added `/api/live-lessons/**` auth rule |
| `CourseDetail.jsx` | Integrated LiveLessonButton |

## Version History

- **2025-01-25**: Initial implementation with self-hosted Jitsi
  - Created backend API for live lesson management
  - Added frontend components for embedded video
  - Configured Jitsi stack in Docker (port 8444)
  - Added performance optimizations for video quality
  - Disabled lobby/auth requirements for seamless joining
