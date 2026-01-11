<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulletin - {{ $student->first_name }} {{ $student->last_name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1e40af;
            --primary-light: #eff6ff;
            --text-dark: #1e293b;
            --text-gray: #64748b;
            --border: #e2e8f0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            padding: 30px;
            background: #f8fafc;
            color: var(--text-dark);
        }
        
        .bulletin-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            padding: 40px;
            position: relative;
            border-top: 6px solid var(--primary);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }
        
        .header-left {
            flex: 1;
            font-size: 9px;
            line-height: 1.6;
            color: var(--text-gray);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .header-center {
            flex: 1;
            text-align: center;
        }
        
        .logo-box {
            width: 80px;
            height: 80px;
            background: var(--primary-light);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .logo-box span {
            font-weight: 800;
            color: var(--primary);
            font-size: 24px;
        }
        
        .header-right {
            flex: 1;
            text-align: right;
        }
        
        .school-name {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 18px;
            color: var(--primary);
        }
        
        .bulletin-title {
            text-align: center;
            background: var(--primary);
            color: white;
            padding: 12px;
            font-size: 16px;
            font-weight: 700;
            border-radius: 8px;
            margin-bottom: 25px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .student-hero {
            display: flex;
            background: var(--primary-light);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            gap: 20px;
            align-items: center;
        }

        .student-photo {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .student-details {
            flex: 1;
        }

        .student-name-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 4px;
        }

        .student-sub-info {
            display: flex;
            gap: 20px;
            color: var(--text-gray);
            font-size: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 20px;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th {
            background: #f8fafc;
            color: var(--text-gray);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 9px;
            padding: 12px 8px;
            border-bottom: 1px solid var(--border);
            text-align: center;
        }
        
        td {
            padding: 10px 8px;
            border-bottom: 1px solid var(--border);
            text-align: center;
            color: var(--text-dark);
        }
        
        .category-header {
            background: #f1f5f9;
            color: var(--primary);
            text-align: left;
            font-weight: 700;
            padding: 8px 15px;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        
        .subject-name {
            text-align: left;
            padding-left: 15px;
            font-weight: 600;
        }
        
        .average-cell {
            font-weight: 700;
            color: var(--primary);
        }

        .subtotal-row {
            background: #f8fafc;
            font-weight: 600;
        }
        
        .total-row {
            background: var(--primary);
            color: white;
            font-weight: 700;
            font-size: 12px;
        }
        
        .total-row td {
            color: white;
            border-bottom: none;
        }
        
        .overall-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 20px;
            border: 2px solid var(--primary);
            border-radius: 12px;
            margin: 25px 0;
        }

        .avg-display {
            text-align: center;
        }

        .avg-value {
            font-size: 28px;
            font-weight: 800;
            color: var(--primary);
        }

        .avg-label {
            font-size: 10px;
            color: var(--text-gray);
            text-transform: uppercase;
            font-weight: 600;
        }

        .rank-display {
            text-align: right;
        }

        .rank-value {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-dark);
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }

        .footer-card {
            background: white;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 15px;
        }

        .card-title {
            font-weight: 700;
            font-size: 10px;
            color: var(--text-gray);
            text-transform: uppercase;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 10px;
        }

        .stat-value {
            font-weight: 700;
        }

        .decision-area {
            height: 80px;
            border: 1px dashed var(--border);
            border-radius: 8px;
            margin-top: 10px;
        }
        
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
        }
        
        .signature-block {
            text-align: center;
            width: 40%;
        }

        .sign-title {
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 50px;
        }

        .sign-line {
            border-top: 1px solid var(--text-dark);
            padding-top: 8px;
            font-size: 10px;
            font-weight: 600;
        }

        @media print {
            body { background: white; padding: 0 !important; }
            .bulletin-container { box-shadow: none; border: none; padding: 15mm !important; }
            * { -webkit-print-color-adjust: exact !important; }
        }
    </style>
</head>
<body>
    <div class="bulletin-container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                RÉPUBLIQUE TOGOLAISE<br>
                <em>Travail - Liberté - Patrie</em><br><br>
                MINISTÈRE DES ENSEIGNEMENTS<br>
                PRIMAIRE ET SECONDAIRE
            </div>
            <div class="header-center">
                <div class="logo-box">
                    <span>{{ strtoupper(substr($establishment->name ?? 'S', 0, 1)) }}</span>
                </div>
            </div>
            <div class="header-right">
                <span class="school-name">{{ $establishment->name ?? 'ÉTABLISSEMENT' }}</span><br>
                <span style="color: var(--text-gray); font-size: 9px;">BP: {{ $establishment->bp ?? '-' }} • Tel: {{ $establishment->phone ?? '-' }}</span><br>
                <strong style="color: var(--text-dark); margin-top: 8px; display: block;">Année scolaire: {{ $period->academicYear->label ?? 'N/A' }}</strong>
            </div>
        </div>

        <!-- Title -->
        <div class="bulletin-title">
            Bulletin de Notes du {{ $period->name ?? 'Trimestre' }}
        </div>

        <!-- Student Hero -->
        <div class="student-hero">
            <div class="student-photo">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-gray)">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="student-details">
                <div class="student-name-title">{{ strtoupper($student->last_name) }} {{ $student->first_name }}</div>
                <div class="student-sub-info">
                    <span><strong>Matricule:</strong> {{ $student->registration_number ?? 'N/A' }}</span>
                    <span><strong>Classe:</strong> {{ $class->name ?? 'N/A' }}</span>
                    <span><strong>Effectif:</strong> {{ $classSize ?? 0 }}</span>
                    <span><strong>Sexe:</strong> {{ $student->gender ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Grades Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 180px; text-align: left; padding-left: 15px;">Matières</th>
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
                @php
                    $grandTotalCoeff = 0;
                    $grandTotalPoints = 0;
                @endphp

                @foreach($subjectsByCategory as $category => $grades)
                    @if(count($grades) > 0)
                        <tr>
                            <td colspan="9" class="category-header">{{ $category }}</td>
                        </tr>
                        @php
                            $categoryCoeff = 0;
                            $categoryPoints = 0;
                        @endphp
                        @foreach($grades as $grade)
                            @php
                                $avg = (($grade->interro_avg ?? 0) * 1 + ($grade->devoir_avg ?? 0) * 1 + ($grade->compo_grade ?? 0) * 2) / 4;
                                $coeff = $grade->subject->coefficient ?? 1;
                                $total = $avg * $coeff;
                                $categoryCoeff += $coeff;
                                $categoryPoints += $total;
                                $grandTotalCoeff += $coeff;
                                $grandTotalPoints += $total;
                            @endphp
                            <tr>
                                <td class="subject-name">{{ $grade->subject->name ?? 'N/A' }}</td>
                                <td>{{ number_format($grade->interro_avg ?? 0, 1) }}</td>
                                <td>{{ number_format($grade->devoir_avg ?? 0, 1) }}</td>
                                <td>{{ number_format($grade->compo_grade ?? 0, 1) }}</td>
                                <td class="average-cell">{{ number_format($avg, 2) }}</td>
                                <td>{{ $coeff }}</td>
                                <td>{{ number_format($total, 2) }}</td>
                                <td style="font-size: 8px;">
                                    @if($grade->subject->teacherAssignments && $grade->subject->teacherAssignments->isNotEmpty())
                                        {{ $grade->subject->teacherAssignments->first()->teacher->name ?? '-' }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td style="font-size: 8px; text-align: left;">
                                    @if($avg >= 16) Très bien
                                    @elseif($avg >= 14) Bien
                                    @elseif($avg >= 12) Assez bien
                                    @elseif($avg >= 10) Passable
                                    @elseif($avg >= 8) Insuffisant
                                    @else Très insuffisant
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                        <tr class="subtotal-row">
                            <td colspan="5" style="text-align: right; padding-right: 15px;">Sous-total {{ $category }}</td>
                            <td>{{ $categoryCoeff }}</td>
                            <td>{{ number_format($categoryPoints, 2) }}</td>
                            <td colspan="2"></td>
                        </tr>
                    @endif
                @endforeach

                <tr class="total-row">
                    <td colspan="5" style="text-align: right; padding-right: 15px;">TOTAL GÉNÉRAL</td>
                    <td>{{ $grandTotalCoeff }}</td>
                    <td>{{ number_format($grandTotalPoints, 2) }}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Overall Box -->
        <div class="overall-box">
            <div class="avg-display">
                <div class="avg-label">Moyenne du {{ $period->name ?? 'Trimestre' }}</div>
                <div class="avg-value">{{ number_format($overallAverage, 2) }} <span style="font-size: 16px; color: var(--text-gray)">/ 20</span></div>
            </div>
            <div class="rank-display">
                <div class="avg-label">Classement</div>
                <div class="rank-value">{{ $rank ?? '-' }} <span style="font-size: 14px; color: var(--text-gray)">sur {{ $classSize ?? 0 }}</span></div>
            </div>
        </div>

        <!-- Footer Grid -->
        <div class="footer-grid">
            <div class="left-footer" style="display: flex; flex-direction: column; gap: 15px;">
                @if(isset($previousPeriods) && count($previousPeriods) > 0)
                <div class="footer-card">
                    <div class="card-title">Synthèse Annuelle</div>
                    @foreach($previousPeriods as $prevPeriod)
                    <div class="stat-item">
                        <span>{{ $prevPeriod['name'] }}</span>
                        <span class="stat-value">{{ $prevPeriod['average'] !== null ? number_format($prevPeriod['average'], 2) . ' / 20' : '-' }}</span>
                    </div>
                    @endforeach
                </div>
                @endif

                <div class="footer-card">
                    <div class="card-title">Observations du Conseil</div>
                    <div class="decision-area"></div>
                </div>
            </div>

            <div class="right-footer" style="display: flex; flex-direction: column; gap: 15px;">
                <div class="footer-card">
                    <div class="card-title">Performances de la Classe</div>
                    <div class="stat-item">
                        <span>Plus forte moyenne</span>
                        <span class="stat-value">{{ number_format($classStats['highest'], 2) }}</span>
                    </div>
                    <div class="stat-item">
                        <span>Plus faible moyenne</span>
                        <span class="stat-value">{{ number_format($classStats['lowest'], 2) }}</span>
                    </div>
                    <div class="stat-item">
                        <span>Moyenne générale</span>
                        <span class="stat-value">{{ number_format($classStats['average'], 2) }}</span>
                    </div>
                </div>

                <div class="footer-card">
                    <div class="card-title">Appréciation Proviseur</div>
                    <div class="decision-area"></div>
                </div>
            </div>
        </div>

        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-block">
                <div class="sign-title">Le Titulaire de Classe</div>
                <div class="sign-line">SIGNATURE</div>
            </div>
            <div class="signature-block">
                <div class="sign-title">Le Chef d'Établissement</div>
                <div class="sign-line">{{ $establishment->city ?? 'Lomé' }}, le ____/____/________</div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 8px; color: var(--text-gray);">
            Ce bulletin généré numériquement est authentique. Il doit être conservé précieusement.
        </div>
    </div>
</body>
</html>
