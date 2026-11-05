using anchored.Data;
using anchored.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace anchored.Chat;

[Authorize(Roles = Roles.Patient)]
public class ChatHub(AppDbContext db, IChatResponder responder) : Hub
{
    public async Task JoinConversation(Guid conversationId)
    {
        await GetOwnedConversationAsync(conversationId);
    }

    public async Task SendMessage(Guid conversationId, string content)
    {
        content = content.Trim();
        if (content.Length is 0 or > 4000) throw new HubException("Message must be 1-4000 characters.");

        var conversation = await GetOwnedConversationAsync(conversationId);
        
        // Save the patient's message, then broadcast it
        var message = new Message
            { ConversationId = conversationId, Sender = MessageSender.Patient, Content = content };
        db.Messages.Add(message);
        conversation.LastMessageAt = message.SentAt;
        await db.SaveChangesAsync();
        await Clients.Group(GroupName(conversationId)).SendAsync("ReceiveMessage", MessageDto.From(message));
        
        // TODO: RedFlagMatcher.FindMatchesAsync(content) → store hits, alert the assigned therapist
        
        // Save and broadcast the AI reply
        var replyText = await responder.ReplyAsync(conversationId, content, Context.ConnectionAborted);
        var reply = new Message { ConversationId = conversationId, Sender = MessageSender.Assistant, Content = replyText };
        db.Messages.Add(reply);
        conversation.LastMessageAt = message.SentAt;
        await db.SaveChangesAsync();
        await Clients.Group(GroupName(conversationId)).SendAsync("ReceiveMessage", MessageDto.From(message));
    }

    private async Task<Conversation> GetOwnedConversationAsync(Guid id) =>
        await db.Conversations.SingleOrDefaultAsync(c => c.Id == id && c.PatientId == Context.UserIdentifier)
        ?? throw new HubException("Conversation not found.");

    private static string GroupName(Guid id) => $"conversation:{id}";
}