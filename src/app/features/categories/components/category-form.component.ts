import { Component, input, output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      title="Are you sure?"
      message="You are about to delete this category."
      [isOpen]="showConfirm"
      (confirmed)="onConfirmDelete()"
      (cancelled)="showConfirm = false"
    />
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 pt-4">
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          formControlName="name"
          type="text"
          placeholder="e.g. Food, Travel, etc."
          [disabled]="disabled()"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
        />
      </div>
      <button type="submit" [disabled]="disabled() || form.invalid"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {{ id() ? 'Save changes' : 'Create category' }}
      </button>
      @if (id()) {
        <button type="button" [disabled]="disabled()" (click)="showConfirm = true"
          class="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2">
          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete category
        </button>
      }
    </form>
  `,
})
export class CategoryFormComponent implements OnInit {
  id = input<string | undefined>(undefined);
  defaultValues = input<{ name?: string }>({});
  disabled = input<boolean>(false);

  submitted = output<{ name: string }>();
  deleted = output<void>();

  showConfirm = false;
  form = inject(FormBuilder).group({ name: ['', Validators.required] });

  ngOnInit() {
    if (this.defaultValues()?.name) this.form.patchValue({ name: this.defaultValues().name });
  }

  onSubmit() {
    if (this.form.valid) this.submitted.emit(this.form.value as { name: string });
  }

  onConfirmDelete() {
    this.showConfirm = false;
    this.deleted.emit();
  }
}
