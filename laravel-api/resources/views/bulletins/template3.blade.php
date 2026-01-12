<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin - {{ $student->last_name }}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12px; color: #000; }
        
        .header { text-align: center; margin-bottom: 25px; }
        .republic { text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
        .motto { font-style: italic; font-size: 10px; }
        
        .bulletin-title { 
            text-align: center; 
            border: 2px solid #000; 
            padding: 10px; 
            margin: 20px 0; 
            font-weight: bold; 
            font-size: 16px; 
            text-transform: uppercase; 
        }
        
        .info-table { width: 100%; border: 1px solid #000; margin-bottom: 20px; border-collapse: collapse; }
        .info-table td { padding: 5px 10px; border: 1px solid #000; }
        
        .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #000; }
        .grades-table th { border: 1px solid #000; padding: 5px; background: #eee; }
        .grades-table td { border: 1px solid #000; padding: 5px; text-align: center; }
        .subject-cell { text-align: left !important; font-weight: bold; }
        
        .footer-table { width: 100%; margin-top: 30px; }
        .footer-table td { vertical-align: top; }
        
        .stamp-box { border: 1px dashed #000; height: 80px; width: 150px; margin: 0 auto; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="republic">République Togolaise</div>
        <div class="motto">Travail - Liberté - Patrie</div>
        <br>
        <strong>{{ $establishment->name }}</strong><br>
        {{ $establishment->address }}
    </div>

    <div class="bulletin-title">
        Bulletin de Notes - {{ $period->name }}
    </div>

    <table class="info-table">
        <tr>
            <td width="50%">
                <strong>Nom:</strong> {{ $student->last_name }}<br>
                <strong>Prénom:</strong> {{ $student->first_name }}<br>
                <strong>Matricule:</strong> {{ $student->registration_number }}
            </td>
            <td width="50%">
                <strong>Classe:</strong> {{ $class->name }}<br>
                <strong>Année:</strong> {{ $period->academicYear->label }}<br>
                <strong>Effectif:</strong> {{ $classSize }}
            </td>
        </tr>
    </table>

    <table class="grades-table">
        <thead>
            <tr>
                <th>Matière</th>
                <th>Dev.</th>
                <th>Compo</th>
                <th>Moy.</th>
                <th>Coef</th>
                <th>Total</th>
                <th>Appréciation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($subjectsByCategory as $category => $grades)
                <tr style="background: #f0f0f0;"><td colspan="7" style="text-align: left; font-style: italic;"><strong>{{ $category }}</strong></td></tr>
                @foreach($grades as $grade)
                    <tr>
                        <td class="subject-cell">{{ $grade->subject->name }}</td>
                        <td>{{ number_format($grade->devoir_avg, 2) }}</td>
                        <td>{{ number_format($grade->compo_grade, 2) }}</td>
                        <td>{{ number_format($grade->average, 2) }}</td>
                        <td>{{ $grade->subject->coefficient }}</td>
                        <td>{{ number_format($grade->weighted_average, 2) }}</td>
                        <td>{{ $grade->appreciation }}</td>
                    </tr>
                @endforeach
            @endforeach
            <tr style="border-top: 2px solid #000; font-weight: bold;">
                <td style="text-align: right;">TOTAL</td>
                <td colspan="3"></td>
                <td>{{ $report->sum('coefficient') }}</td>
                <td>{{ number_format($report->sum('weighted_average'), 2) }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <table class="footer-table">
        <tr>
            <td width="50%">
                <strong>Résultats:</strong><br>
                Moyenne: {{ number_format($overallAverage, 2) }} / 20<br>
                Rang: {{ $rank }}<br>
                <br>
                <strong>Observation du Conseil:</strong><br>
                <div style="margin-top: 5px; font-style: italic;">
                    {{ $overallAverage >= 10 ? 'Passe en classe supérieure' : 'Redouble la classe' }}
                </div>
            </td>
            <td width="50%" align="center">
                <strong>Le Directeur</strong>
                <div class="stamp-box">
                    <br>Cachet
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
