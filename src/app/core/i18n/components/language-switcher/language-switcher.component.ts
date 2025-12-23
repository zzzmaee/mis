import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, NzSelectModule, NzIconModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.less',
})
export class LanguageSwitcherComponent {
  protected readonly translationService: TranslationService = inject(TranslationService);
}
