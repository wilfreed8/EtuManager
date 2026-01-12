<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin de Notes - {{ $student->last_name }} {{ $student->first_name }}</title>
    <style>
        @page {
            size: A4;
            margin: 5mm;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 5px;
            box-sizing: border-box;
        }
        
        .header {
            width: 100%;
            margin-bottom: 10px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
        }
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        .center-text {
            text-align: center;
        }
        .left-text {
            text-align: left;
        }
        .right-text {
            text-align: right;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .bold {
            font-weight: bold;
        }
        
        .school-info {
            font-size: 10px;
            line-height: 1.2;
        }
        .republic-info {
            font-size: 10px;
            line-height: 1.2;
        }
        
        .title-box {
            background-color: #d1d5db; /* Gray-300 */
            text-align: center;
            padding: 5px;
            margin: 10px 0;
            font-weight: bold;
            border-radius: 4px; /* Mimic rounded pill in image */
            font-size: 14px;
        }
        
        .student-box-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            background-color: #f3f4f6; /* Light gray */
            border: 1px solid #9ca3af;
        }
        .student-box-table td {
            padding: 5px;
            border: none;
        }

        .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 10px;
        }
        .grades-table th, .grades-table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: center;
        }
        .grades-table th {
            background-color: #e5e7eb;
            font-weight: bold;
        }
        .grades-table .subject-col {
            text-align: left;
            width: 25%;
        }
        .grades-table .category-row {
            background-color: #dbeafe; /* Light blue */
            font-weight: bold;
            text-align: left;
            padding-left: 10px;
        }
        
        .footer-section {
            display: flex; /* Flex doesn't work well in DOMPDF sometimes, using table instead */
            width: 100%;
            margin-top: 10px;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .footer-table td {
            border: 1px solid #000;
            padding: 5px;
            vertical-align: top;
        }

        .summary-box {
            border: 1px solid #000;
            padding: 5px;
            margin-top: 5px;
            font-size: 10px;
        }
        
        .signature-box {
            border: 1px solid #000;
            height: 80px;
            margin-top: 5px;
            text-align: center;
            font-weight: bold;
        }
        
        .logo-img {
            max-height: 60px;
            max-width: 60px;
        }
        
        /* Utility */
        .w-full { width: 100%; }
        .text-xs { font-size: 9px; }
        .mb-2 { margin-bottom: 5px; }
        
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td width="40%" class="center-text school-info">
                @if($establishment->logo)
                    <img src="{{ public_path($establishment->logo) }}" class="logo-img"><br>
                @endif
                <span class="uppercase bold">{{ $establishment->name }}</span><br>
                {{ $establishment->address }}<br>
                Tél: {{ $establishment->phone }}<br>
                {{ $establishment->city }}
            </td>
            <td width="20%" class="center-text">
                <!-- Center Logo or Emblem -->
                <!-- <img src="..." class="logo-img"> -->
            </td>
            <td width="40%" class="center-text republic-info">
                <span class="uppercase bold">République Togolaise</span><br>
                Travail - Liberté - Patrie<br>
                <br>
                Année Scolaire: {{ $period->academicYear->label }}
            </td>
        </tr>
    </table>

    <!-- Title -->
    <div class="title-box uppercase">
        BULLETIN DE NOTES DU {{ $period->name }}
    </div>

    <!-- Student Info -->
    <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">
        Classe : {{ $class->name }} &nbsp;&nbsp;&nbsp;&nbsp; Effectif : {{ $classSize }}
    </div>
    
    <table class="student-box-table">
        <tr>
            <td width="60%">
                NOM ET PRENOMS : <span class="uppercase bold" style="font-size: 14px;">{{ $student->last_name }} {{ $student->first_name }}</span>
            </td>
            <td width="40%" class="right-text">
                Statut : <span class="bold">N/A</span> <br> <!-- Statut (Nouveau/Ancien) - Need DB field -->
                Sexe : <span class="bold">{{ $student->gender }}</span> <br>
                Matricule : <span class="bold">{{ $student->registration_number }}</span>
            </td>
        </tr>
    </table>

    <!-- Grades Table -->
    <table class="grades-table">
        <thead>
            <tr>
                <th class="subject-col">Matières</th>
                <th>Interro</th>
                <th>Devoir</th>
                <th>Compo</th>
                <th>Moy.<br>(20)</th>
                <th>Coef</th>
                <th>Total</th>
                <th>Rang</th>
                <th>Professeur</th>
                <th>Appréciation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($subjectsByCategory as $category => $grades)
                <tr class="category-row">
                    <td colspan="10">{{ $category }}</td>
                </tr>
                @foreach($grades as $grade)
                    <tr>
                        <td class="subject-col">{{ $grade->subject->name }}</td>
                        <td>{{ number_format($grade->interro_avg, 2) }}</td>
                        <td>{{ number_format($grade->devoir_avg, 2) }}</td>
                        <td>{{ number_format($grade->compo_grade, 2) }}</td>
                        <td class="bold">{{ number_format($grade->average, 2) }}</td>
                        <td>{{ $grade->subject->coefficient }}</td>
                        <td>{{ number_format($grade->weighted_average, 2) }}</td>
                        <td>-</td> <!-- Rank per subject could be calc -->
                        <td class="text-xs">{{ $grade->teacher }}</td>
                        <td class="text-xs">{{ $grade->appreciation }}</td>
                    </tr>
                @endforeach
            @endforeach
            
            <!-- Totals Row -->
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td class="right-text">TOTAL GENERALE</td>
                <td colspan="4"></td>
                <td>{{ $report->sum('coefficient') }}</td>
                <td>{{ number_format($report->sum('weighted_average'), 2) }}</td>
                <td colspan="3"></td>
            </tr>
        </tbody>
    </table>

    <!-- Footer / Summary -->
    <table class="footer-table">
        <tr>
            <!-- Left: History & Decision -->
            <td width="60%">
                <div class="mb-2">
                    <strong>Moyenne Trimestrielle :</strong>
                    <span style="font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 3px 8px; border-radius: 4px; margin-left: 10px;">
                        {{ number_format($overallAverage, 2) }}
                    </span>
                    &nbsp;&nbsp; <strong>Rang :</strong> {{ $rank }} / {{ $classSize }}
                </div>
                
                <div style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                    <strong>Historique :</strong><br>
                    @foreach($previousPeriods as $prev)
                        {{ $prev['name'] }}: {{ $prev['average'] !== null ? number_format($prev['average'], 2) : '-' }} <br>
                    @endforeach
                </div>
                
                <div style="margin-top: 15px;">
                    <strong>DÉCISION DU CONSEIL DE CLASSE :</strong><br>
                    <div style="font-family: 'Brush Script MT', cursive; font-size: 18px; color: #1e3a8a; margin-top: 5px;">
                        <!-- Simple logic for decision based on avg -->
                        @if($overallAverage >= 10) Admis(e) @else Échoué(e) @endif
                    </div>
                </div>
            </td>
            
            <!-- Right: Stats & Signatures -->
            <td width="40%">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 2px;">Plus forte moy.</td>
                        <td style="border: 1px solid #ccc; padding: 2px; font-weight: bold;">{{ number_format($classStats['highest'], 2) }}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 2px;">Plus faible moy.</td>
                        <td style="border: 1px solid #ccc; padding: 2px; font-weight: bold;">{{ number_format($classStats['lowest'], 2) }}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 2px;">Moyenne Classe</td>
                        <td style="border: 1px solid #ccc; padding: 2px; font-weight: bold;">{{ number_format($classStats['average'], 2) }}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 50px; text-align: center;">
                    <strong>Le Chef d'Établissement</strong><br>
                    <br><br><br>
                </div>
            </td>
        </tr>
    </table>
    
    <div style="font-size: 9px; margin-top: 5px; text-align: center; color: #666;">
        Bulletin généré électroniquement par Antigravity - {{ now()->format('d/m/Y H:i') }}
    </div>

</body>
</html>
