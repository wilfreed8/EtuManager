<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('class_subjects')) {
            return;
        }

        // If the table already uses composite PK, do nothing
        if (!Schema::hasColumn('class_subjects', 'id')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // Drop primary key on id
            DB::statement('ALTER TABLE class_subjects DROP PRIMARY KEY');

            // If a unique index exists on (class_id, subject_id), drop it before adding PK
            // MySQL can otherwise error depending on existing index metadata.
            try {
                DB::statement('ALTER TABLE class_subjects DROP INDEX class_subjects_class_id_subject_id_unique');
            } catch (Throwable $e) {
                // ignore
            }
        }

        Schema::table('class_subjects', function (Blueprint $table) {
            if (Schema::hasColumn('class_subjects', 'id')) {
                $table->dropColumn('id');
            }
        });

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE class_subjects ADD PRIMARY KEY (class_id, subject_id)');

            // Recreate unique index for compatibility with existing queries/tools
            DB::statement('ALTER TABLE class_subjects ADD UNIQUE KEY class_subjects_class_id_subject_id_unique (class_id, subject_id)');
        } else {
            Schema::table('class_subjects', function (Blueprint $table) {
                $table->primary(['class_id', 'subject_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('class_subjects')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE class_subjects DROP PRIMARY KEY');

            try {
                DB::statement('ALTER TABLE class_subjects DROP INDEX class_subjects_class_id_subject_id_unique');
            } catch (Throwable $e) {
                // ignore
            }
        }

        Schema::table('class_subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('class_subjects', 'id')) {
                $table->uuid('id')->first();
            }
        });

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE class_subjects ADD PRIMARY KEY (id)');
        }

        Schema::table('class_subjects', function (Blueprint $table) {
            // Restore unique constraint if missing
            $table->unique(['class_id', 'subject_id']);
        });
    }
};
