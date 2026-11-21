namespace anchored.Models;

public record AccountsSum(
    int Patients,
    int Therapists,
    int Admins
);

public record ConversationsSum(
    int ActiveConversations,
    int Messages
);

public record OpenAlertsSum(
    int High,
    int Medium
);

public record AiUsagePurpose(
    string Detail,
    decimal Usd
);

public record SpendingSum(
    decimal UsedUsd,
    decimal BudgetUsd,
    List<AiUsagePurpose> ByPurpose
);

public record MessagesPerDay(
    DateTimeOffset Date,
    int Count
);

public record ServiceStatus(
    string Name,
    string Detail,
    bool Working
);

public record NeedsAttention(
    string Label,
    int Count,
    string To
);

public record MonitoringSummary(
    AccountsSum Accounts,
    ConversationsSum Conversations,
    OpenAlertsSum OpenAlerts,
    SpendingSum Spending,
    List<MessagesPerDay> MessagesPerDay,
    List<ServiceStatus> Services,
    bool AiRepliesEnabled,
    List<NeedsAttention> NeedsAttention
    );