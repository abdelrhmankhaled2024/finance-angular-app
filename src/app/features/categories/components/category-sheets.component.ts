import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideDrawerComponent } from '../../../shared/components/side-drawer/side-drawer.component';
import { CategoryFormComponent } from './category-form.component';
import { CategorySheetService } from '../services/category-sheet.service';
import { CategoriesService } from '../services/categories.service';

@Component({
  selector: 'app-category-sheets',
  standalone: true,
  imports: [CommonModule, SideDrawerComponent, CategoryFormComponent],
  template: `
    <app-side-drawer [isOpen]="sheetService.isNewOpen()" title="New Category"
      description="Create a new category." (closed)="sheetService.closeNew()">
      <app-category-form [disabled]="categoriesService.isPending()" (submitted)="onCreate($event)" />
    </app-side-drawer>

    <app-side-drawer [isOpen]="sheetService.isEditOpen()" title="Edit Category"
      description="Edit an existing category." (closed)="onCloseEdit()">
      @if (sheetService.isEditOpen() && editDefaults) {
        <app-category-form
          [id]="sheetService.editId()"
          [defaultValues]="editDefaults"
          [disabled]="categoriesService.isPending()"
          (submitted)="onEdit($event)"
          (deleted)="onDelete()"
        />
      }
    </app-side-drawer>
  `,
})
export class CategorySheetsComponent {
  sheetService      = inject(CategorySheetService);
  categoriesService = inject(CategoriesService);
  editDefaults: { name?: string } | null = null;

  ngDoCheck() {
    if (this.sheetService.isEditOpen() && this.sheetService.editId() && !this.editDefaults) {
      const cat = this.categoriesService.getOne(this.sheetService.editId()!);
      if (cat) this.editDefaults = { name: cat.name };
    }
    if (!this.sheetService.isEditOpen()) this.editDefaults = null;
  }

  onCreate(values: { name: string }) {
    this.categoriesService.create(values);
    this.sheetService.closeNew();
  }

  onEdit(values: { name: string }) {
    const id = this.sheetService.editId();
    if (!id) return;
    this.categoriesService.update(id, values);
    this.sheetService.closeEdit();
  }

  onDelete() {
    const id = this.sheetService.editId();
    if (!id) return;
    this.categoriesService.delete(id);
    this.sheetService.closeEdit();
  }

  onCloseEdit() { this.editDefaults = null; this.sheetService.closeEdit(); }
}
