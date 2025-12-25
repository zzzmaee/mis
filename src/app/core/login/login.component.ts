import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {NzFormModule} from 'ng-zorro-antd/form';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {AuthService} from '../services/auth.service';
import {NotificationService} from '../services/notification.service';
import {LanguageSwitcherComponent} from '../i18n/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzFormModule,
    NgOptimizedImage,
    TranslatePipe,
    NzInputModule,
    NzButtonModule,
    LanguageSwitcherComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent {
  protected readonly loginForm: FormGroup;
  protected isLoading = false;

  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _notification = inject(NotificationService);
  private readonly _translate = inject(TranslateService);

  constructor() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9_]+$/),
      ]),
      password: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const {username, password} = this.loginForm.value;

    this._authService
      .fetchKeycloakToken({
        username, password
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this._router.navigate(['/patient-visit']);
          this._notification.success(this._translate.instant('AUTH.NOTIFICATIONS.SUCCESS'));
        },
        error: () => {
          this.isLoading = false;
          this._notification.error(this._translate.instant('AUTH.NOTIFICATIONS.ERROR'));
        },
      });
  }
}
