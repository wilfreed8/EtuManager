<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin - {{ $student->first_name }} {{ $student->last_name }}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f0f0f0; }
        .footer { margin-top: 50px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $establishment->name }}</h1>
        <h2>Bulletin de Notes - {{ $period->name }}</h2>
    </div>

    <div class="info">
        <div>
            <strong>Nom:</strong> {{ $student->last_name }}<br>
            <strong>Prénoms:</strong> {{ $student->first_name }}<br>
            <strong>Classe:</strong> {{ $class->name }}
        </div>
        <div>
            <strong>Année Scolaire:</strong> {{ $period->academicYear->label }}<br>
            <strong>Matricule:</strong> {{ $student->registration_number }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Matière</th>
                <th>Coef</th>
                <th>Interro</th>
                <th>Devoir</th>
                <th>Compo</th>
                <th>Moyenne</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($report as $row)
            <tr>
                <td>{{ $row['subject'] }}</td>
                <td>{{ $row['coefficient'] }}</td>
                <td>{{ $row['interro'] }}</td>
                <td>{{ $row['devoir'] }}</td>
                <td>{{ $row['compo'] }}</td>
                <td>{{ number_format($row['average'], 2) }}</td>
                <td>{{ number_format($row['weighted_average'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6" style="text-align: right;"><strong>Moyenne Générale</strong></td>
                <td><strong>{{ number_format($overallAverage, 2) }} / 20</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Le Directeur des Études</p>
    </div>
</body>
</html>
