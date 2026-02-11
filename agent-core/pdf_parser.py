
import sys
import json
import pdfplumber
import os

def parse_pdf(file_path):
    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    try:
        text_content = ""
        metadata = {}
        num_pages = 0

        with pdfplumber.open(file_path) as pdf:
            metadata = pdf.metadata
            num_pages = len(pdf.pages)
            for page in pdf.pages:
                text_content += page.extract_text() or ""
                text_content += "\n"

        result = {
            "text": text_content,
            "numpages": num_pages,
            "info": metadata
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python pdf_parser.py <path>"}))
        sys.exit(1)
    
    parse_pdf(sys.argv[1])
