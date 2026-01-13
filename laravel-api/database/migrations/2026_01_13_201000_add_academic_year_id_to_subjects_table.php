<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'academic_year_id')) {
                $table->foreignUuid('academic_year_id')
                    ->nullable()
                    ->after('establishment_id')
                    ->constrained('academic_years')
                    ->onDelete('cascade');

                $table->index(['establishment_id', 'academic_year_id']);
            }
        });

        // Backfill existing subjects: assign them to the establishment selected year if exists, otherwise active year.
        // If neither exists, we leave academic_year_id null (subjects won't show until assigned).
        $rows = DB::table('subjects')
            ->select('subjects.id', 'subjects.establishment_id')
            ->get();

        foreach ($rows as $r) {
            $est = DB::table('establishments')
                ->select('selected_academic_year_id')
                ->where('id', $r->establishment_id)
                ->first();

            $yearId = $est?->selected_academic_year_id;

            if (!$yearId) {
                $active = DB::table('academic_years')
                    ->select('id')
                    ->where('establishment_id', $r->establishment_id)
                    ->where('is_active', 1)
                    ->first();
                $yearId = $active?->id;
            }

            if ($yearId) {
                DB::table('subjects')
                    ->where('id', $r->id)
                    ->whereNull('academic_year_id')
                    ->update(['academic_year_id' => $yearId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            if (Schema::hasColumn('subjects', 'academic_year_id')) {
                $table->dropForeign(['academic_year_id']);
                $table->dropIndex(['establishment_id', 'academic_year_id']);
                $table->dropColumn('academic_year_id');
            }
        });
    }
};
