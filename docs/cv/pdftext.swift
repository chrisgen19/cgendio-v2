// Dev helper: print the text an ATS parser would extract from a PDF.
// Usage: swift docs/cv/pdftext.swift <file.pdf>
import Foundation
import PDFKit

let url = URL(fileURLWithPath: CommandLine.arguments[1])
if let doc = PDFDocument(url: url), let text = doc.string {
  print(text)
} else {
  print("FAILED to extract text")
}
