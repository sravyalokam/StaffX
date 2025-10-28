import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-my-utility',
  imports: [CommonModule],
  templateUrl: './my-utility-button.html',
  styleUrls: ['./my-utility-button.css']
})
export class MyUtilityButton implements OnChanges {
  @Input() label: string = 'Click';
  @Input() textColor: string = '#fff';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: string  = 'primary';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() icon?: string; 
  @Output() clicked = new EventEmitter<void>();

  safeIcon?: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    if (this.icon) {
      this.safeIcon = this.sanitizer.bypassSecurityTrustHtml(this.icon);
    }
  }

  onClick() {
    if (!this.disabled && !this.isLoading) {
      this.clicked.emit();
    }
  }

  getButtonStyles() {
    const isHexColor = this.variant?.startsWith('#');
    return {
      backgroundColor: isHexColor ? this.variant : this.getPredefinedColor(this.variant),
      color: this.textColor || '#fff',
    };
  }

  getPredefinedColor(variant: string): string {
    switch (variant) {
      case 'primary': return '#007bff';
      case 'secondary': return '#394253';
      case 'danger': return '#dc3545';
      case 'transparent': return '#e6e8e9ff';
      default: return '#007bff';
    }
  }
}
