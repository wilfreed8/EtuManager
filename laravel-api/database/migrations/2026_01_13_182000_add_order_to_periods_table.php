<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('periods', function (Blueprint $table) {
            if (!Schema::hasColumn('periods', 'order')) {
                $table->unsignedTinyInteger('order')->default(1)->after('name');
                $table->index(['academic_year_id', 'order']);
            }
        });

        // Backfill: create default periods for academic years that currently have none.
        // This fixes the case where period creation previously failed due to missing 'order' column.
        $years = DB::table('academic_years')->select('id', 'establishment_id')->get();

        foreach ($years as $year) {
            $hasAny = DB::table('periods')->where('academic_year_id', $year->id)->exists();
            if ($hasAny) {
                continue;
            }

            $establishment = DB::table('establishments')->select('period_type')->where('id', $year->establishment_id)->first();
            $periodType = $establishment?->period_type ?? 'TRIMESTRE';

            $periods = $periodType === 'SEMESTRE'
                ? [
                    ['name' => '1er Semestre', 'order' => 1],
                    ['name' => '2ème Semestre', 'order' => 2],
                ]
                : [
                    ['name' => '1er Trimestre', 'order' => 1],
                    ['name' => '2ème Trimestre', 'order' => 2],
                    ['name' => '3ème Trimestre', 'order' => 3],
                ];

            $now = now();
            $rows = [];
            foreach ($periods as $p) {
                $rows[] = [
                    'id' => (string) Str::uuid(),
                    'academic_year_id' => $year->id,
                    'name' => $p['name'],
                    'order' => $p['order'],
                    'is_active' => $p['order'] === 1,
                    'start_date' => null,
                    'end_date' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('periods')->insert($rows);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('periods', function (Blueprint $table) {
            if (Schema::hasColumn('periods', 'order')) {
                $table->dropIndex(['academic_year_id', 'order']);
                $table->dropColumn('order');
            }
        });
    }
};
