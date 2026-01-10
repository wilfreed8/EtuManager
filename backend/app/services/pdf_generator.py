from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
import io

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_style = ParagraphStyle(
            'CustomStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=12
        )

    def generate_report_card(self, student_data, grades_data, school_info):
        """
        Generates a PDF report card for a single student.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        elements = []

        # 1. Header (School Info)
        elements.append(Paragraph(f"<b>{school_info['name']}</b>", self.styles['Title']))
        elements.append(Paragraph(f"{school_info['address']}", self.styles['Normal']))
        elements.append(Paragraph(f"Contact: {school_info['phone']}", self.styles['Normal']))
        elements.append(Spacer(1, 1*cm))

        # 2. Student Info
        elements.append(Paragraph(f"<b>BULLETIN DE NOTES</b>", self.styles['Heading2']))
        elements.append(Paragraph(f"Année Scolaire: {student_data['academic_year']}", self.styles['Normal']))
        elements.append(Paragraph(f"Période: {student_data['period']}", self.styles['Normal']))
        elements.append(Spacer(1, 0.5*cm))
        
        student_info = [
            [f"Élève: {student_data['name']}", f"Matricule: {student_data['matricule']}"],
            [f"Classe: {student_data['class']}", f"Rang: {student_data['rank']}"]
        ]
        t_student = Table(student_info, colWidths=[9*cm, 8*cm])
        t_student.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_student)
        elements.append(Spacer(1, 1*cm))

        # 3. Grades Table
        data = [['Matière', 'Coef', 'Interro', 'Devoir', 'Compo', 'Moyenne', 'Appréciation']]
        for g in grades_data:
            data.append([
                g['subject'],
                str(g['coef']),
                str(g['interro']),
                str(g['devoir']),
                str(g['compo']),
                f"<b>{g['moyenne']:.2f}</b>",
                g['appreciation']
            ])

        t_grades = Table(data, colWidths=[4*cm, 1*cm, 2*cm, 2*cm, 2*cm, 2*cm, 4*cm])
        t_grades.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ]))
        elements.append(t_grades)
        elements.append(Spacer(1, 1*cm))

        # 4. Summary & Totals
        summary = [
            ["MOYENNE GÉNÉRALE", f"{student_data['general_avg']:.2f} / 20"],
            ["RÉSULTAT", "PASSAGE" if student_data['general_avg'] >= 10 else "REDOUBLEMENT"]
        ]
        t_sum = Table(summary, colWidths=[13*cm, 4*cm])
        t_sum.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 12),
            ('ALIGN', (1,0), (1,1), 'CENTER'),
            ('BACKGROUND', (0,0), (-1,-1), colors.lightgrey),
        ]))
        elements.append(t_sum)
        elements.append(Spacer(1, 2*cm))

        # 5. Signatures
        sig = [["Le Parent", "", "Le Chef d'Établissement"]]
        t_sig = Table(sig, colWidths=[6*cm, 5*cm, 6*cm])
        elements.append(t_sig)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
