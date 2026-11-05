namespace anchored.Models;

public enum DisclosureType
{
    FirstUse,
    FirstChat
}

public class DisclosureAcceptance
{
    public DisclosureType Type { get; set; }
    public DateTimeOffset AcceptedAt { get; set; } = DateTimeOffset.UtcNow;
}
