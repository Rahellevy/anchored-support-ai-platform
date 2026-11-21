using anchored.Data;
using anchored.Models;
using anchored.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

namespace anchored.Hubs;

public record AiReply(
    string Text,
    int InputTokens,
    int OutputTokens
    );

public class OpenAiChatResponder(ChatClient client, AppDbContext db, AiUsageRecorder aiUsageRecorder, IOptions<OpenAiOptions> options) : IChatResponder
{
    private readonly OpenAiOptions _aiOptions = options.Value;
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
            messages, new ChatCompletionOptions { MaxOutputTokenCount = _aiOptions.MaxOutputTokens }, ct);

        var text = result.Content.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Empty model response");
        
        
        // Record usage
        var usage = result.Usage;
        await aiUsageRecorder.RecordAsync(
            AiPurpose.ChatReply,
            _aiOptions.ChatModel,
            usage.InputTokenCount,
            usage.InputTokenDetails?.CachedTokenCount ?? 0,
            usage.OutputTokenCount,
            null, // TODO: Retrieve and add userId 
            ct
            );

        return new AiReply(text, result.Usage.InputTokenCount, result.Usage.OutputTokenCount);
    }
}