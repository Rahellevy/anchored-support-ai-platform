namespace anchored.Chat;

public interface IChatResponder
{
    Task<string> ReplyAsync(Guid conversationId, string userMessage, CancellationToken token);
}

public class PlaceHolderChatResponder : IChatResponder
{
    public Task<string> ReplyAsync(Guid conversationId, string userMessage, CancellationToken token) =>
        Task.FromResult("Thanks for sharing. (Placeholder reply — AI not connected yet.)");
}