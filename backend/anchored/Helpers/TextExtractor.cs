using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;


namespace anchored.Helpers;

public static class TextExtractor
{
    public static readonly string[] SupportedExtensions = [".txt", ".md", ".pdf", ".docx"];

    public static async Task<string> ExtractAsync(string path, string filename, CancellationToken ct)
    {
        var text = Path.GetExtension(filename).ToLowerInvariant() switch
        {
            ".txt" or ".md" => await File.ReadAllTextAsync(path, ct),
            ".pdf" => ExtractPdf(path),
            ".docx" => ExtractDocx(path),
            var ext => throw new NotSupportedException($"Unsupported file type '{ext}'.")
        };
        
        // A scanned PDF is just images, so extraction "succeeds" with no text
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("No text could be extracted. Is it a scanned document?");
        return text;
    }

    private static string ExtractPdf(string path)
    {
        using var pdf = PdfDocument.Open(path);
        var sb = new StringBuilder();
        foreach (var page in pdf.GetPages())
        {
            // page.Text often loses line breaks and spaces, which breaks paragraph chunking;
            // this extractor keeps reading order and inserts line breaks
            sb.Append(ContentOrderTextExtractor.GetText(page)).Append("\n\n");
        }

        return sb.ToString();
    }

    private static string ExtractDocx(string path)
    {
        using var doc = WordprocessingDocument.Open(path, isEditable: false);
        var body = doc.MainDocumentPart?.Document?.Body;
        if (body is null) return "";

        return string.Join("\n\n", body.Descendants<Paragraph>()
            .Select(p => p.InnerText)
            .Where(t => !string.IsNullOrWhiteSpace(t)));

    }
}