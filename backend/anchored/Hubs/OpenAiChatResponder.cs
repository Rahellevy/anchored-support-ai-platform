using anchored.Data;
using anchored.Models;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;

namespace anchored.Hubs;

public record AiReply(
    string Text,
    int InputTokens,
    int OutputTokens
    );

public class OpenAiChatResponder(ChatClient client, AppDbContext db) : IChatResponder
{
    private const int MAX_OUTPUT_TOKEN = 1000;

    private const string SystemPrompt = 
        """
        You are a supportive conversational companion for patients of a counseling service.
        You are not a therapist: no diagnoses, no medication advice.
        """;
        
    public async Task<AiReply> ReplyAsync(Guid conversationId, CancellationToken ct)
    {
        var history = await db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt).Take(20)
            .OrderBy(m => m.SentAt)
            .ToListAsync(ct);

        List<ChatMessage> messages = [new SystemChatMessage(SystemPrompt)];
        messages.AddRange(history.Select(m => m.Sender == MessageSender.Patient 
            ? (ChatMessage)new UserChatMessage(m.Content) 
            : new AssistantChatMessage(m.Content)));

        ChatCompletion result = await client.CompleteChatAsync(
            messages, new ChatCompletionOptions { MaxOutputTokenCount = MAX_OUTPUT_TOKEN }, ct);

        var text = result.Content.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Empty model response");

        return new AiReply(text, result.Usage.InputTokenCount, result.Usage.OutputTokenCount);
    }
}