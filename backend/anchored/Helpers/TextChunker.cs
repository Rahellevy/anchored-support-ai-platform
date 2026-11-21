using System.Text;

namespace anchored.Helpers;

public static class TextChunker
{
    
    /// <summary>Splits text into ~maxChars pieces on paragraph breaks, carrying a little overlap forward.</summary>
    public static IEnumerable<string> Chunk(string text, int maxChars = 2500, int overlap = 300)
    {
        var paragraphs = text
            .Replace("\r\n", "\n")
            .Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var current = new StringBuilder();
        foreach (var p in paragraphs)
        {
            if (current.Length + p.Length > maxChars && current.Length > 0)
            {
                yield return current.ToString();
                var tail = current.ToString()[^Math.Min(overlap, current.Length)..];
                current.Clear().Append(tail).Append("\n\n");
            }

            current.Append(p).Append("\n\n");
        }

        // After the loop: inside it, this returned a growing copy after every paragraph (duplicate chunks)
        if (current.Length > 0) yield return current.ToString();
    }
    
}