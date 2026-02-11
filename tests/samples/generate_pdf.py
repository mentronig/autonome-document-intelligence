
from fpdf import FPDF
import os

os.makedirs("doc/samples", exist_ok=True)

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="T2 Release Note - R2025.JUN", ln=1, align="C")
pdf.cell(200, 10, txt="1. Introduction", ln=1, align="L")
pdf.multi_cell(0, 10, txt="This document describes the changes for the T2 R2025.JUN release.\n\n2. PBI-123456: Fixed issue in RTGS GUI\n- Description: The RTGS GUI was not displaying the correct balance for specific liquidity transfers.\n- Impact: Low. Visual only.\n\n3. PBI-789012: Updated camt.053 schema validation\n- Description: The schema for camt.053 has been updated to include the new 'Clean Hydrogen' tax credit fields.\n- Impact: High. Requires update to backend parsers.\n\n4. CR-999: New Settlement Window\n- Description: The settlement window has been extended by 30 minutes.\n")
pdf.output("doc/samples/T2_Release_Note_Dummy.pdf")
print("PDF generated successfully.")
