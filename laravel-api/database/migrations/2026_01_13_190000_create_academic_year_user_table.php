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
        Schema::create('academic_year_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['academic_year_id', 'user_id']);
            $table->index(['user_id', 'academic_year_id']);
        });

        // Backfill: link existing teachers to the currently selected/active academic year of their establishment.
        // This makes existing data usable immediately without manual re-creation.
        $rows = DB::table('users')
            ->join('establishments', 'establishments.id', '=', 'users.establishment_id')
            ->leftJoin('academic_years', function ($join) {
                $join->on('academic_years.establishment_id', '=', 'establishments.id')
                    ->where('academic_years.is_active', '=', 1);
            })
            ->select('users.id as user_id', 'establishments.selected_academic_year_id as selected_year_id', 'academic_years.id as active_year_id')
            ->whereNotNull('users.establishment_id')
            ->get();

        $inserts = [];
        $now = now();
        foreach ($rows as $r) {
            $yearId = $r->selected_year_id ?: $r->active_year_id;
            if (!$yearId) {
                continue;
            }
            $inserts[] = [
                'id' => (string) Str::uuid(),
                'academic_year_id' => $yearId,
                'user_id' => $r->user_id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($inserts)) {
            // Insert while respecting unique constraint
            foreach (array_chunk($inserts, 500) as $chunk) {
                foreach ($chunk as $row) {
                    DB::table('academic_year_user')->updateOrInsert(
                        ['academic_year_id' => $row['academic_year_id'], 'user_id' => $row['user_id']],
                        $row
                    );
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_year_user');
    }
};
