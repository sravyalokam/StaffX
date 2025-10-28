import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-utility',
  imports: [FormsModule, CommonModule],
  templateUrl: './pagination-utility.html',
  styleUrl: './pagination-utility.css'
})
export class PaginationUtility {
  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() totalItems!: number;
  @Input() pageSize!: number;

  pageSizes = [5, 10, 20, 50, 100];

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();
  @Output() onJumpToPage = new EventEmitter<number>();

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePageSize(newSize: number) {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.onPageSizeChange.emit(this.pageSize);
  }

  jumpToPage(newPage: number) {
    this.currentPage = Number(newPage);
    this.onJumpToPage.emit(this.currentPage);
    this.onPageSizeChange.emit(this.pageSize);
  }

  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onPageChange.emit(this.currentPage);
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onPageChange.emit(this.currentPage);
    }
  }

  get itemsOnCurrentPage(): number {
    if (!this.totalItems) return 0;

    if (this.currentPage < this.totalPages) {
      return this.pageSize;
    }

    const remaining = this.totalItems - (this.pageSize * (this.totalPages - 1));
    return remaining > 0 ? remaining : this.totalItems;
  }


}
