import { Injectable, inject } from '@angular/core';
import { FinanceDataService } from '../../../shared/services/finance-data.service';

export type { Category } from '../../../shared/services/finance-data.service';

/**
 * CategoriesService
 * Thin wrapper — delegates entirely to FinanceDataService.
 */
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private data = inject(FinanceDataService);

  categories = this.data.categories;
  isLoading  = this.data.isLoadingCategories;
  isPending  = this.data.isPending;

  loadAll()                               { this.data.loadCategories(); }
  getOne(id: string)                      { return this.data.getCategory(id); }
  create(payload: { name: string })       { this.data.createCategory(payload.name); }
  update(id: string, p: { name: string }) { this.data.updateCategory(id, p.name); }
  delete(id: string)                      { this.data.deleteCategory(id); }
  bulkDelete(ids: string[])               { this.data.bulkDeleteCategories(ids); }
}
