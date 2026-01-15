<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin - {{ $student->last_name }} {{ $student->first_name }}</title>
    <style>
        @page { size: A4; margin: 10mm; }

        :root {
            --primary: #6d28d9;
            --primary-light: #f5f3ff;
            --text-dark: #1e293b;
            --text-gray: #64748b;
            --border: #e2e8f0;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            color: var(--text-dark);
        }

        .bulletin-container {
            width: 100%;
            border-top: 4px solid var(--primary);
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .header-left {
            font-size: 9px;
            line-height: 1.4;
            color: var(--text-gray);
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .header-right {
            text-align: right;
        }

        .school-name {
            font-weight: 800;
            font-size: 16px;
            color: var(--primary);
        }

        .logo-box {
            width: 50px;
            height: 50px;
            background: var(--primary-light);
            border-radius: 12px;
            display: inline-block;
            text-align: center;
            line-height: 50px;
            border: 1px solid var(--border);
        }

        .logo-img {
            max-height: 50px;
            max-width: 50px;
        }

        .bulletin-title {
            text-align: center;
            background: var(--primary);
            color: #fff;
            padding: 8px;
            font-size: 14px;
            font-weight: 800;
            border-radius: 8px;
            margin: 10px 0 12px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .student-card {
            width: 100%;
            border: 1px solid var(--border);
            background: var(--primary-light);
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
        }

        .student-name {
            font-size: 14px;
            font-weight: 800;
        }

        .muted { color: var(--text-gray); }

        .grades-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid var(--border);
            margin-bottom: 10px;
            font-size: 9px;
        }

        .grades-table th {
            background: #f8fafc;
            color: var(--text-gray);
            font-weight: 800;
            text-transform: uppercase;
            font-size: 8px;
            padding: 6px 4px;
            border-bottom: 1px solid var(--border);
        }

        .grades-table td {
            padding: 6px 4px;
            border-bottom: 1px solid var(--border);
            text-align: center;
        }

        .category-row td {
            background: #f1f5f9;
            color: var(--primary);
            font-weight: 800;
            text-align: left;
            padding-left: 10px;
        }

        .subject-cell { text-align: left; padding-left: 10px; font-weight: 700; }
        .avg-cell { font-weight: 800; color: var(--primary); }

        .total-row td {
            background: var(--primary);
            color: #fff;
            font-weight: 800;
            border-bottom: none;
        }

        .overall-box {
            width: 100%;
            border: 2px solid var(--primary);
            border-radius: 10px;
            padding: 10px;
            margin: 10px 0;
        }

        .overall-table { width: 100%; border-collapse: collapse; }
        .overall-table td { vertical-align: top; }
        .big-number { font-size: 22px; font-weight: 900; color: var(--primary); }
        .label { font-size: 9px; text-transform: uppercase; font-weight: 800; color: var(--text-gray); }

        .footer-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .footer-table td { vertical-align: top; padding: 6px; }

        .card {
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 8px;
        }

        .card-title {
            font-weight: 900;
            font-size: 9px;
            color: var(--text-gray);
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .signatures-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        .signatures-table td { width: 50%; text-align: center; padding: 6px; vertical-align: top; }
        .sign-title { font-weight: 900; font-size: 10px; margin-bottom: 34px; }
        .sign-line { border-top: 1px solid var(--text-dark); padding-top: 6px; font-size: 9px; font-weight: 700; }

        .small-note { text-align: center; margin-top: 8px; font-size: 8px; color: var(--text-gray); }
    </style>
</head>
<body>
    <div class="bulletin-container">
        <table class="header-table">
            <tr>
                <td width="38%" class="header-left">
                    RÉPUBLIQUE TOGOLAISE<br>
                    <span style="font-style: italic; text-transform:none;">Travail - Liberté - Patrie</span><br><br>
                    MINISTÈRE DES ENSEIGNEMENTS<br>
                    PRIMAIRE ET SECONDAIRE
                </td>
                <td width="24%" style="text-align:center;">
                    <div class="logo-box">
                        @if($establishment->logo)
                            <img src="{{ public_path($establishment->logo) }}" class="logo-img">
                        @else
                            <span style="font-weight: 900; color: var(--primary);">{{ strtoupper(substr($establishment->name ?? 'E', 0, 1)) }}</span>
                        @endif
                    </div>
                </td>
                <td width="38%" class="header-right">
                    <div class="school-name">{{ $establishment->name }}</div>
                    <div class="muted" style="font-size:9px; line-height:1.3;">
                        {{ $establishment->address }}@if($establishment->city) • {{ $establishment->city }}@endif<br>
                        @if($establishment->phone) Tel: {{ $establishment->phone }}@endif
                    </div>
                    <div style="margin-top:6px; font-weight:800;">Année scolaire: {{ $period->academicYear->label }}</div>
                </td>
            </tr>
        </table>

        <div class="bulletin-title">Bulletin de Notes - {{ $period->name }}</div>

        <div class="student-card">
            <table style="width:100%; border-collapse: collapse;">
                <tr>
                    <td width="70%">
                        <div class="student-name">{{ strtoupper($student->last_name) }} {{ $student->first_name }}</div>
                        <div class="muted" style="margin-top:4px; font-size:9px;">
                            <strong>Matricule:</strong> {{ $student->registration_number ?? 'N/A' }} &nbsp;&nbsp;|
                            <strong>Classe:</strong> {{ $class->name }} &nbsp;&nbsp;|
                            <strong>Effectif:</strong> {{ $classSize }} &nbsp;&nbsp;|
                            <strong>Sexe:</strong> {{ $student->gender ?? '-' }}
                        </div>
                    </td>
                    <td width="30%" style="text-align:right; font-size:9px;" class="muted">
                        Généré le: {{ now()->format('d/m/Y') }}
                    </td>
                </tr>
            </table>
        </div>

        <table class="grades-table">
            <thead>
                <tr>
                    <th style="text-align:left; padding-left:10px; width: 170px;">Matières</th>
                    <th>Int.</th>
                    <th>Dev.</th>
                    <th>Comp.</th>
                    <th>Moy./20</th>
                    <th>Coef.</th>
                    <th>Total</th>
                    <th style="width: 100px;">Professeur</th>
                    <th style="width: 120px;">Appréciation</th>
                </tr>
            </thead>
            <tbody>
                @foreach($subjectsByCategory as $category => $rows)
                    <tr class="category-row"><td colspan="9">{{ $category }}</td></tr>
                    @foreach($rows as $row)
                        <tr>
                            <td class="subject-cell">{{ $row['subject'] ?? 'N/A' }}</td>
                            <td>{{ number_format((float)($row['interro'] ?? 0), 2) }}</td>
                            <td>{{ number_format((float)($row['devoir'] ?? 0), 2) }}</td>
                            <td>{{ number_format((float)($row['compo'] ?? 0), 2) }}</td>
                            <td class="avg-cell">{{ number_format((float)($row['average'] ?? 0), 2) }}</td>
                            <td>{{ (int)($row['coefficient'] ?? 1) }}</td>
                            <td>{{ number_format((float)($row['weighted_average'] ?? 0), 2) }}</td>
                            <td style="font-size:8px;" class="muted">{{ $row['teacher'] ?? 'N/A' }}</td>
                            <td style="font-size:8px;" class="muted">{{ $row['appreciation'] ?? '' }}</td>
                        </tr>
                    @endforeach
                @endforeach

                <tr class="total-row">
                    <td colspan="5" style="text-align:right; padding-right:10px;">TOTAL GÉNÉRAL</td>
                    <td>{{ $report->sum('coefficient') }}</td>
                    <td>{{ number_format((float)$report->sum('weighted_average'), 2) }}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>

        <div class="overall-box">
            <table class="overall-table">
                <tr>
                    <td width="50%" style="text-align:center;">
                        <div class="label">Moyenne du {{ $period->name }}</div>
                        <div class="big-number">{{ number_format((float)$overallAverage, 2) }} <span style="font-size:12px; color: var(--text-gray);">/ 20</span></div>
                    </td>
                    <td width="50%" style="text-align:center;">
                        <div class="label">Classement</div>
                        <div style="font-size:18px; font-weight:900;">{{ $rank }} <span style="font-size:12px; color: var(--text-gray);">sur {{ $classSize }}</span></div>
                    </td>
                </tr>
            </table>
        </div>

        <table class="footer-table">
            <tr>
                <td width="50%">
                    <div class="card">
                        <div class="card-title">Synthèse Annuelle</div>
                        @forelse($previousPeriods as $prev)
                            <table style="width:100%; border-collapse:collapse; font-size:9px; margin-bottom:4px;">
                                <tr>
                                    <td class="muted" style="text-align:left;">{{ $prev['name'] }}</td>
                                    <td style="text-align:right; font-weight:800;">{{ $prev['average'] !== null ? number_format((float)$prev['average'], 2) : '-' }}</td>
                                </tr>
                            </table>
                        @empty
                            <div class="muted" style="font-size:9px;">-</div>
                        @endforelse
                    </div>
                    <div class="card">
                        <div class="card-title">Observations du Conseil</div>
                        <div style="height:60px; border:1px dashed var(--border); border-radius:8px;"></div>
                    </div>
                </td>
                <td width="50%">
                    <div class="card">
                        <div class="card-title">Performances de la Classe</div>
                        <table style="width:100%; border-collapse:collapse; font-size:9px;">
                            <tr>
                                <td class="muted" style="text-align:left; padding-bottom:4px;">Plus forte moyenne</td>
                                <td style="text-align:right; font-weight:800; padding-bottom:4px;">{{ number_format((float)($classStats['highest'] ?? 0), 2) }}</td>
                            </tr>
                            <tr>
                                <td class="muted" style="text-align:left; padding-bottom:4px;">Plus faible moyenne</td>
                                <td style="text-align:right; font-weight:800; padding-bottom:4px;">{{ number_format((float)($classStats['lowest'] ?? 0), 2) }}</td>
                            </tr>
                            <tr>
                                <td class="muted" style="text-align:left;">Moyenne générale</td>
                                <td style="text-align:right; font-weight:800;">{{ number_format((float)($classStats['average'] ?? 0), 2) }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="card">
                        <div class="card-title">Appréciation Proviseur</div>
                        <div style="height:60px; border:1px dashed var(--border); border-radius:8px;"></div>
                    </div>
                </td>
            </tr>
        </table>

        <table class="signatures-table">
            <tr>
                <td>
                    <div class="sign-title">Le Titulaire de Classe</div>
                    <div class="sign-line">SIGNATURE</div>
                </td>
                <td>
                    <div class="sign-title">Le Chef d'Établissement</div>
                    <div class="sign-line">Lomé, le ____/____/________</div>
                </td>
            </tr>
        </table>

        <div class="small-note">Ce bulletin généré numériquement est authentique. Il doit être conservé précieusement.</div>
    </div>
</body>
</html>
