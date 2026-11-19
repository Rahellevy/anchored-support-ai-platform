using anchored.Data;
using anchored.Models;
using anchored.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace anchored.Hubs;

[Authorize(Roles = Roles.Patient)]
public class ChatHub(AppDbContext db, IChatResponder responder, RedFlagMatcher redFlagMatcher) : Hub
{
    public async Task JoinConversation(Guid conversationId)
    {
        await GetOwnedConversationAsync(conversationId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conversationId));
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
        var matches = await redFlagMatcher.FindMatchesAsync(message.Content);
        foreach (var match in matches)
        {
            var open = await db.Alerts.FirstOrDefaultAsync(a =>
                a.ConversationId == conversationId && a.RuleId == match.RuleId && a.Status == AlertStatus.Open);
            if (open is not null) open.RelatedMessages++;
            else
            {
                db.Alerts.Add(new Alert
                {
                    PatientId = conversation.PatientId, ConversationId = conversationId,
                    MessageId = message.Id, RuleId = match.RuleId, RuleName = match.Name,
                    MatchType = match.MatchType, Severity = match.Severity, Reason = match.Reason
                });
            }
        }
        
        // Save and broadcast the AI reply
        var response = await responder.ReplyAsync(conversationId, Context.ConnectionAborted);
        var reply = new Message { ConversationId = conversationId, Sender = MessageSender.Assistant, Content = response.Text };
        db.Messages.Add(reply);
        conversation.LastMessageAt = reply.SentAt;
        await db.SaveChangesAsync();
        await Clients.Group(GroupName(conversationId)).SendAsync("ReceiveMessage", MessageDto.From(reply));
    }

    private async Task<Conversation> GetOwnedConversationAsync(Guid id) =>
        await db.Conversations.SingleOrDefaultAsync(c => c.Id == id && c.PatientId == Context.UserIdentifier)
        ?? throw new HubException("Conversation not found.");

    private static string GroupName(Guid id) => $"conversation:{id}";
}