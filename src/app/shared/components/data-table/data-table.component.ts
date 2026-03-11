import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => string;
  template?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div>
      <!-- Confirm dialog -->
      <app-confirm-dialog
        title="Are you sure?"
        message="You are about to perform a bulk delete."
        [isOpen]="showConfirm()"
        (confirmed)="onConfirmDelete()"
        (cancelled)="showConfirm.set(false)"
      />

      <!-- Filter + delete bar -->
      <div class="flex items-center py-4 gap-2">
        <input
          type="text"
          [placeholder]="'Filter ' + filterKey() + '...'"
          [(ngModel)]="filterValue"
          (input)="onFilter()"
          class="max-w-sm px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        @if (selectedIds().size > 0) {
          <button
            [disabled]="disabled()"
            (click)="confirmBulkDelete()"
            class="ml-auto flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete ({{ selectedIds().size }})
          </button>
        }
      </div>

      <!-- Table -->
      <div class="rounded-md border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="w-10 px-4 py-3 text-left">
                <input type="checkbox" (change)="toggleAll($event)" [checked]="allSelected()" class="rounded" />
              </th>
              @for (col of columns(); track col.key) {
                <th
                  class="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  (click)="col.sortable !== false && sort(col.key)"
                >
                  {{ col.label }}
                  @if (sortKey() === col.key) {
                    <span class="ml-1">{{ sortDir() === 'asc' ? '↑' : '↓' }}</span>
                  }
                </th>
              }
              <th class="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            @if (paginatedData().length === 0) {
              <tr><td [attr.colspan]="columns().length + 2" class="h-24 text-center text-gray-400">No results.</td></tr>
            }
            @for (row of paginatedData(); track getRowId(row)) {
              <tr class="border-b hover:bg-gray-50 transition" [class.bg-blue-50]="selectedIds().has(getRowId(row))">
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    [checked]="selectedIds().has(getRowId(row))"
                    (change)="toggleRow(getRowId(row))"
                    class="rounded"
                  />
                </td>
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3 text-gray-700">
                    {{ col.render ? col.render(row) : getCell(row, col.key) }}
                  </td>
                }
                <td class="px-4 py-3">
                  <button
                    class="text-blue-600 hover:underline text-xs"
                    (click)="rowEdit.emit(getRowId(row))"
                  >Edit</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-end space-x-2 py-4">
        <span class="flex-1 text-sm text-gray-500">
          {{ selectedIds().size }} of {{ filteredData().length }} row(s) selected.
        </span>
        <button
          class="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
          [disabled]="page() === 0"
          (click)="page.update(p => p - 1)"
        >Previous</button>
        <button
          class="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
          [disabled]="(page() + 1) * pageSize >= filteredData().length"
          (click)="page.update(p => p + 1)"
        >Next</button>
      </div>
    </div>
  `,
})
export class DataTableComponent<T extends Record<string, any>> {
  columns = input.required<TableColumn<T>[]>();
  data = input<T[]>([]);
  filterKey = input<string>('name');
  disabled = input<boolean>(false);

  rowEdit = output<string>();
  bulkDelete = output<string[]>();

  filterValue = '';
  pageSize = 10;
  page = signal(0);
  sortKey = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  selectedIds = signal<Set<string>>(new Set());
  showConfirm = signal(false);

  filteredData = computed(() => {
    let d = this.data();
    if (this.filterValue) {
      const q = this.filterValue.toLowerCase();
      d = d.filter(row => String(row[this.filterKey()] ?? '').toLowerCase().includes(q));
    }
    if (this.sortKey()) {
      const key = this.sortKey();
      const dir = this.sortDir();
      d = [...d].sort((a, b) => {
        const av = a[key]; const bv = b[key];
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return d;
  });

  paginatedData = computed(() => {
    const start = this.page() * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  allSelected = computed(() => {
    const ids = this.paginatedData().map(r => this.getRowId(r));
    return ids.length > 0 && ids.every(id => this.selectedIds().has(id));
  });

  getRowId(row: T) { return String(row['id'] ?? ''); }
  getCell(row: T, key: string) { return row[key] ?? ''; }

  sort(key: string) {
    if (this.sortKey() === key) this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(key); this.sortDir.set('asc'); }
  }

  onFilter() { this.page.set(0); }

  toggleRow(id: string) {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      const ids = this.paginatedData().map(r => this.getRowId(r));
      this.selectedIds.update(set => { const next = new Set(set); ids.forEach(id => next.add(id)); return next; });
    } else {
      this.selectedIds.set(new Set());
    }
  }

  confirmBulkDelete() { this.showConfirm.set(true); }

  onConfirmDelete() {
    this.bulkDelete.emit([...this.selectedIds()]);
    this.selectedIds.set(new Set());
    this.showConfirm.set(false);
  }
}
