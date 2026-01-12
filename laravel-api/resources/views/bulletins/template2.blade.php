<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin - {{ $student->last_name }}</title>
    <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #333; }
        
        .header-table { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .school-name { font-size: 18px; font-weight: bold; color: #2563eb; text-transform: uppercase; }
        .academic-year { font-size: 14px; color: #666; text-align: right; }
        
        .title { text-align: center; font-size: 16px; font-weight: bold; margin: 20px 0; color: #1e40af; }
        
        .student-card { background: #fefffe; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .student-table { width: 100%; }
        .student-name { font-size: 16px; font-weight: bold; color: #111; }
        
        .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .grades-table th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; padding: 8px; border-bottom: 2px solid #e2e8f0; }
        .grades-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; }
        .grades-table .subject { text-align: left; font-weight: 500; color: #334155; }
        .grades-table .category { background-color: #eff6ff; color: #1e40af; font-weight: bold; text-align: left; padding: 5px 10px; }
        
        .footer { display: flex; justify-content: space-between; margin-top: 30px; }
        .summary { width: 48%; background: #f8fafc; padding: 15px; border-radius: 8px; }
        .decision { margin-top: 10px; font-weight: bold; color: #2563eb; }
        .signatures { width: 48%; text-align: center; }
        
        .badge { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td>
                <div class="school-name">{{ $establishment->name }}</div>
                <div>{{ $establishment->address }}</div>
                <div>{{ $establishment->phone }}</div>
            </td>
            <td class="academic-year">
                <strong>Année Scolaire</strong><br>
                {{ $period->academicYear->label }}
            </td>
        </tr>
    </table>

    <div class="title">BULLETIN DE NOTES - {{ strtoupper($period->name) }}</div>

    <div class="student-card">
        <table class="student-table">
            <tr>
                <td>
                    <div style="font-size: 10px; color: #666;">ÉLÈVE</div>
                    <div class="student-name">{{ $student->last_name }} {{ $student->first_name }}</div>
                </td>
                <td style="text-align: right;">
                    <span class="badge">{{ $class->name }}</span>
                    <div style="margin-top: 5px;">Matricule: {{ $student->registration_number }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="grades-table">
        <thead>
            <tr>
                <th style="text-align: left;">Matière</th>
                <th>Coeff</th>
                <th>Moyenne</th>
                <th>Total</th>
                <th>Rang</th>
                <th>Appréciation / Prof</th>
            </tr>
        </thead>
        <tbody>
            @foreach($subjectsByCategory as $category => $grades)
                <tr><td colspan="6" class="category">{{ $category }}</td></tr>
                @foreach($grades as $grade)
                    <tr>
                        <td class="subject">{{ $grade->subject->name }}</td>
                        <td>{{ $grade->subject->coefficient }}</td>
                        <td><strong>{{ number_format($grade->average, 2) }}</strong></td>
                        <td>{{ number_format($grade->weighted_average, 2) }}</td>
                        <td>-</td>
                        <td style="font-size: 10px; color: #666;">
                            {{ $grade->appreciation }} <br>
                            <span style="font-style: italic;">{{ $grade->teacher }}</span>
                        </td>
                    </tr>
                @endforeach
            @endforeach
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td style="text-align: right;">TOTAL GÉNÉRAL</td>
                <td>{{ $report->sum('coefficient') }}</td>
                <td>{{ number_format($overallAverage, 2) }}</td>
                <td>{{ number_format($report->sum('weighted_average'), 2) }}</td>
                <td colspan="2"></td>
            </tr>
        </tbody>
    </table>

    <table style="width: 100%;">
        <tr>
            <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                <div class="summary">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Moyenne Trimestrielle:</span>
                        <strong>{{ number_format($overallAverage, 2) }} / 20</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Rang:</span>
                        <strong>{{ $rank }} / {{ $classSize }}</strong>
                    </div>
                    <div style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 5px;">
                        <div>Décision du conseil:</div>
                        <div class="decision">{{ $overallAverage >= 10 ? 'ADMIS(E)' : 'ÉCHOUÉ(E)' }}</div>
                    </div>
                </div>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                <div class="signatures">
                    <div style="margin-bottom: 40px; font-weight: bold; color: #333;">Le Chef d'Établissement</div>
                    <div style="border-bottom: 1px solid #ccc; width: 60%; margin: 0 auto;"></div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
