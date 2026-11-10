namespace anchored.Hubs;

public interface IChatResponder
{
    Task<AiReply> ReplyAsync(Guid conversationId, CancellationToken token);
}

// public class PlaceHolderChatResponder : IChatResponder
// {
//     public Task<AiReply> ReplyAsync(Guid conversationId, string userMessage, CancellationToken token) =>
//         Task.FromResult("Thanks for sharing. (Placeholder reply — AI not connected yet.)");
// }