$path = "e:\Projekt\EduFlex\eduflex\src\main\java\com\eduflex\backend\service\CalendarService.java"
$content = Get-Content $path -Raw
$newMethods = @"
    public boolean isUserBusy(User user, LocalDateTime start, LocalDateTime end, Long excludeEventId) {
        if (user == null || start == null || end == null) return false;
        List<CalendarEvent> allEvents = eventRepository.findAll();
        return allEvents.stream()
                .filter(event -> excludeEventId == null || !event.getId().equals(excludeEventId))
                .filter(event -> {
                    boolean isOwner = event.getOwner() != null && event.getOwner().getId().equals(user.getId());
                    boolean isAttendee = event.getAttendees().stream().anyMatch(a -> a.getId().equals(user.getId()));
                    return isOwner || isAttendee;
                })
                .anyMatch(event -> start.isBefore(event.getEndTime()) && end.isAfter(event.getStartTime()));
    }

    public void validateEventAvailability(CalendarEvent event) {
        if (event == null || event.getStartTime() == null || event.getEndTime() == null) return;
        if (event.getOwner() != null && isUserBusy(event.getOwner(), event.getStartTime(), event.getEndTime(), event.getId())) {
            throw new IllegalStateException("Användaren " + event.getOwner().getUsername() + " är redan bokad.");
        }
        for (User attendee : event.getAttendees()) {
            if (isUserBusy(attendee, event.getStartTime(), event.getEndTime(), event.getId())) {
                throw new IllegalStateException("Deltagaren " + attendee.getUsername() + " är redan bokad.");
            }
        }
    }
}
"@
$content = $content.TrimEnd() -replace '\}$', $newMethods
Set-Content $path $content
