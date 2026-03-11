import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesService, Category } from '../../features/categories/services/categories.service';
import { CategorySheetService } from '../../features/categories/services/category-sheet.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div class="bg-white rounded-xl border-none drop-shadow-sm">
        @if (categoriesService.isLoading()) {
          <div class="p-6">
            <div class="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div class="h-[500px] flex items-center justify-center">
              <div class="size-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        } @else {
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-2 p-6 pb-2">
            <h1 class="text-xl font-semibold line-clamp-1">Categories</h1>
            <button (click)="sheetService.openNew()"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 lg:w-auto w-full justify-center">
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add new
            </button>
          </div>
          <div class="p-6 pt-0">
            <app-data-table
              [columns]="columns"
              [data]="categoriesService.categories()"
              filterKey="name"
              [disabled]="categoriesService.isPending()"
              (rowEdit)="sheetService.openEdit($event)"
              (bulkDelete)="onBulkDelete($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  categoriesService = inject(CategoriesService);
  sheetService      = inject(CategorySheetService);

  columns: TableColumn<Category>[] = [
    { key: 'name', label: 'Name', sortable: true },
  ];

  ngOnInit() { this.categoriesService.loadAll(); }
  onBulkDelete(ids: string[]) { this.categoriesService.bulkDelete(ids); }
}
