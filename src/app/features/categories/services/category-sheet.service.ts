import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CategorySheetService {
  isNewOpen = signal(false);
  isEditOpen = signal(false);
  editId = signal<string | undefined>(undefined);

  openNew() { this.isNewOpen.set(true); }
  closeNew() { this.isNewOpen.set(false); }

  openEdit(id: string) { this.editId.set(id); this.isEditOpen.set(true); }
  closeEdit() { this.isEditOpen.set(false); this.editId.set(undefined); }
}
