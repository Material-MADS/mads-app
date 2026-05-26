from django.core.management.base import BaseCommand
from django.db.models import Q

from datamanagement.models import DataSource
from common.helpers import get_csv_dimensions


class Command(BaseCommand):
    help = "Backfill file_size, num_of_rows, and num_of_columns for DataSource records where any value is null."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show which records would be updated without saving changes.",
        )

    def handle(self, *args, **options):
        queryset = DataSource.objects.filter(
            Q(file_size__isnull=True)
            | Q(num_of_rows__isnull=True)
            | Q(num_of_columns__isnull=True)
        )
        total = queryset.count()
        updated = 0
        skipped = 0

        if total == 0:
            self.stdout.write(self.style.SUCCESS("No DataSource records need backfilling."))
            return

        for datasource in queryset:
            if not datasource.file:
                skipped += 1
                continue

            try:
                size = datasource.file.size
            except Exception as exc:
                self.stderr.write(
                    self.style.WARNING(
                        f"Skipping {datasource.id}: could not read file size ({exc})"
                    )
                )
                skipped += 1
                continue

            num_rows, num_columns = get_csv_dimensions(datasource.file)

            if not options["dry_run"]:
                datasource.file_size = size
                datasource.num_of_rows = num_rows
                datasource.num_of_columns = num_columns
                datasource.save(update_fields=["file_size", "num_of_rows", "num_of_columns"])

            self.stdout.write(
                f"Updated {datasource.id}: {size} bytes, {num_rows} rows, {num_columns} columns"
            )
            updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Backfilled {updated} records, skipped {skipped} records out of {total}."
            )
        )
